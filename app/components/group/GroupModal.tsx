import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Form } from "react-router";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Document {
  id: string;
  title: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users and documents when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsersAndDocuments();
    }
  }, [isOpen]);

  const fetchUsersAndDocuments = async () => {
    try {
      // Fetch users - adjust the endpoint to match your API
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.success ? usersData.data : []);
      }

      // Fetch documents - adjust the endpoint to match your API
      const docsRes = await fetch("/api/documents?action=list");
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.success ? docsData.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch users/documents:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Generate a unique ID for the group
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create the group
      const createRes = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id: groupId,
          name: groupName,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.message || "Failed to create group");
      }

      const createData = await createRes.json();
      const createdGroupId = createData.data.id;

      // Add members
      for (const memberId of selectedMembers) {
        await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "addMember",
            groupId: createdGroupId,
            userId: memberId,
          }),
        });
      }

      // Add documents
      for (const documentId of selectedDocuments) {
        await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "addDocument",
            groupId: createdGroupId,
            documentId: documentId,
          }),
        });
      }

      // Reset form and close modal
      setGroupName("");
      setSelectedMembers([]);
      setSelectedDocuments([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <Form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group name"
            />
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members (Optional)
            </label>
            <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No users available</div>
              ) : (
                users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selectedMembers.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          {/* Documents Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Documents (Optional)
            </label>
            <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No documents available</div>
              ) : (
                documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => toggleDocument(doc.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 text-sm text-gray-900">{doc.title}</div>
                  </label>
                ))
              )}
            </div>
            {selectedDocuments.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </Form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !groupName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}