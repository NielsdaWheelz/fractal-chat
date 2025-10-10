import { useId } from "react";
import type { GroupWithDetails } from "~/types/types";
import { useGroupModal } from "~/hooks/use-group-modal";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editGroup?: GroupWithDetails | null;
}

export function GroupModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editGroup 
}: GroupModalProps) {
  const id = useId();

  const {
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
  } = useGroupModal({ isOpen, editGroup });

  const onSubmit = async (e: React.FormEvent) => {
    try {
      await handleSubmit(e);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const onDelete = async () => {
    try {
      await handleDelete();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // console.log(selectedMembers)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-2xl [&>button:last-child]:top-3.5">
        {/* Header */}
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {editGroup ? "Edit Group" : "Create New Group"}
          </DialogTitle>
        </DialogHeader>
        
        <DialogDescription className="sr-only">
          {editGroup 
            ? "Edit group details, add or remove members and documents, or delete the group." 
            : "Create a new group by providing a name and optionally adding members and documents."}
        </DialogDescription>

        {/* Scrollable Content */}
        <div className="overflow-y-auto">
          <div className="px-6 pt-6 pb-6">
            {/* Error Display */}
            {error && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor={`${id}-group-name`}>
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`${id}-group-name`}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                  disabled={loading}
                  aria-required="true"
                />
              </div>

              {/* Members Selection */}
              <div className="space-y-2">
                <Label htmlFor={`${id}-members`}>
                  Add Members <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <div 
                  id={`${id}-members`}
                  className="max-h-48 overflow-y-auto rounded-md border border-input"
                  role="group"
                  aria-label="Member selection"
                >
                  {users.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      No users available
                    </div>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center px-4 py-2 hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user.id)}
                          onChange={() => toggleMember(user.id)}
                          disabled={loading}
                          className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label={`Add ${user.name} to group`}
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {selectedMembers.length > 0 && (
                  <p className="text-sm text-muted-foreground" role="status">
                    {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* Documents Selection */}
              <div className="space-y-2">
                <Label htmlFor={`${id}-documents`}>
                  Add Documents <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <div 
                  id={`${id}-documents`}
                  className="max-h-48 overflow-y-auto rounded-md border border-input"
                  role="group"
                  aria-label="Document selection"
                >
                  {documents.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      No documents available
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex cursor-pointer items-center px-4 py-2 hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => toggleDocument(doc.id)}
                          disabled={loading}
                          className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label={`Add ${doc.title} to group`}
                        />
                        <div className="ml-3 text-sm">{doc.title}</div>
                      </label>
                    ))
                  )}
                </div>
                {selectedDocuments.length > 0 && (
                  <p className="text-sm text-muted-foreground" role="status">
                    {selectedDocuments.length} document{selectedDocuments.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="flex-row justify-between border-t px-6 py-4">
          {/* Delete button (only when editing) */}
          {editGroup && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Group"}
            </Button>
          )}
          
          {/* Spacer when not editing */}
          {!editGroup && <div />}

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={loading || !groupName.trim()}
            >
              {loading 
                ? (editGroup ? "Updating..." : "Creating...") 
                : (editGroup ? "Update Group" : "Create Group")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
