import { useState, useEffect } from "react";
import type { GroupWithDetails, UserBasic, DocumentBasic } from "~/types/types";

interface UseGroupModalProps {
  isOpen: boolean;
  editGroup?: GroupWithDetails | null;
}

interface UseGroupModalReturn {
  groupName: string;
  setGroupName: (name: string) => void;
  selectedMembers: string[];
  selectedDocuments: string[];

  users: UserBasic[];
  documents: DocumentBasic[];

  loading: boolean;
  error: string | null;

  toggleMember: (userId: string) => void;
  toggleDocument: (docId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  resetForm: () => void;
}

export function useGroupModal({
  isOpen,
  editGroup,
}: UseGroupModalProps): UseGroupModalReturn {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const [users, setUsers] = useState<UserBasic[]>([]);
  const [documents, setDocuments] = useState<DocumentBasic[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(editGroup?.members)

  useEffect(() => {
    if (isOpen) fetchUsersAndDocuments();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editGroup) {
      setGroupName(editGroup.name || "");
      setSelectedMembers(editGroup.members.map(m => m.id));
      setSelectedDocuments(editGroup.documents.map(d => d.id));
    } else if (isOpen && !editGroup) {
      resetForm();
    }
  }, [isOpen, editGroup]);

  const fetchUsersAndDocuments = async () => {
    try {
      const usersRes = await fetch("/api/groups?action=allUsers");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.success ? usersData.data : []);
      }

      const docsRes = await fetch("/api/groups?action=allDocuments");
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.success ? docsData.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch users/documents:", err);
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

  const updateGroup = async (group: GroupWithDetails) => {
    const updateRes = await fetch("/api/groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: group.id,
        name: groupName,
      }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      throw new Error(errorData.message || "Failed to update group");
    }

    const existingMemberIds = group.members.map(m => m.id);
    const membersToRemove = existingMemberIds.filter(id => !selectedMembers.includes(id));
    const membersToAdd = selectedMembers.filter(id => !existingMemberIds.includes(id));

    for (const memberId of membersToRemove) {
      await fetch("/api/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "removeMember",
          groupId: group.id,
          userId: memberId,
        }),
      });
    }

    for (const memberId of membersToAdd) {
      await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addMember",
          groupId: group.id,
          userId: memberId,
        }),
      });
    }

    const existingDocumentIds = group.documents.map(d => d.id);
    const documentsToRemove = existingDocumentIds.filter(id => !selectedDocuments.includes(id));
    const documentsToAdd = selectedDocuments.filter(id => !existingDocumentIds.includes(id));

    for (const documentId of documentsToRemove) {
      await fetch("/api/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "removeDocument",
          groupId: group.id,
          documentId: documentId,
        }),
      });
    }

    for (const documentId of documentsToAdd) {
      await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addDocument",
          groupId: group.id,
          documentId: documentId,
        }),
      });
    }
  };

  const createGroup = async () => {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (editGroup) {
        await updateGroup(editGroup);
      } else {
        await createGroup();
      }

      resetForm();
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editGroup) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the group "${editGroup.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setError(null);
    setLoading(true);

    try {
      const deleteRes = await fetch("/api/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          groupId: editGroup.id,
        }),
      });

      if (!deleteRes.ok) {
        const errorData = await deleteRes.json();
        throw new Error(errorData.message || "Failed to delete group");
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedMembers([]);
    setSelectedDocuments([]);
    setError(null);
  };

  return {
    groupName,
    setGroupName,
    selectedMembers,
    selectedDocuments,
    users,
    documents,
    loading,
    error,
    toggleMember,
    toggleDocument,
    handleSubmit,
    handleDelete,
    resetForm,
  };
}

