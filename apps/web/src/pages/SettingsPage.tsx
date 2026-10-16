import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-zinc-400">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [deleteConfirmPw, setDeleteConfirmPw] = useState("");
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("New passwords don't match");
      return;
    }
    setChangingPw(true);
    try {
      await api.auth.changePassword(currentPw, newPw);
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setChangingPw(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    try {
      await api.auth.deleteAccount(deleteConfirmPw);
      logout();
      navigate("/register");
      toast.success("Account deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10 max-w-md">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-zinc-200">Account</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-200">Change password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <PasswordField
            label="Current password"
            value={currentPw}
            onChange={setCurrentPw}
          />
          <PasswordField
            label="New password"
            value={newPw}
            onChange={setNewPw}
            placeholder="At least 8 characters"
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPw}
            onChange={setConfirmPw}
          />
          <button
            type="submit"
            disabled={changingPw || !currentPw || !newPw || !confirmPw}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {changingPw && <Loader2 size={14} className="animate-spin" />}
            Update password
          </button>
        </form>
      </section>

      <section className="space-y-4 border-t border-red-900/40 pt-8">
        <div>
          <h2 className="text-sm font-medium text-red-400">Danger zone</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Permanently delete your account and all your voice entries. This cannot be undone.
          </p>
        </div>

        {!showDeleteForm ? (
          <button
            onClick={() => setShowDeleteForm(true)}
            className="px-4 py-2 rounded-lg text-sm border border-red-800 text-red-400 hover:bg-red-950/40 transition-colors"
          >
            Delete account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <PasswordField
              label="Confirm your password to delete"
              value={deleteConfirmPw}
              onChange={setDeleteConfirmPw}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deleting || !deleteConfirmPw}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Yes, delete my account
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteForm(false); setDeleteConfirmPw(""); }}
                className="px-4 py-2 rounded-lg text-sm border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
