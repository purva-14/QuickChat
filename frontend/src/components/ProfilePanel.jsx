import { useEffect, useState } from "react";
import { HiOutlineCamera, HiXMark } from "react-icons/hi2";
import api from "../api/axios";
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function ProfilePanel({ open, onClose, user, editable, startInEditMode, onUpdated, media = [] }) {
  const [editing, setEditing] = useState(!!startInEditMode);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Reset local form state whenever the drawer opens for a (possibly different) user
  useEffect(() => {
    if (open) {
      setEditing(!!startInEditMode);
      setFullName(user?.fullName || "");
      setBio(user?.bio || "");
      setAvatarFile(null);
      setPreview(null);
    }
  }, [open, user, startInEditMode]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated(data.user);
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop, click to close */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer: fixed to the right, slides in regardless of screen width */}
      <aside
        className={`fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-base-900 border-l border-base-700 z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-700">
          <p className="text-sm font-medium text-gray-300">{editable ? "Your Profile" : "Contact Info"}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-neon">
            <HiXMark className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col items-center pt-8 pb-5 border-b border-base-700">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-base-700 border-2 border-neon shadow-neon-sm">
              {preview || user?.avatar ? (
                <img
                  src={preview || `${SERVER_URL}${user.avatar}`}
                  className="w-full h-full object-cover"
                  alt={user?.fullName}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neon text-3xl font-semibold">
                  {user?.fullName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {editable && editing && (
              <label className="absolute bottom-0 right-0 bg-neon text-black rounded-full p-1.5 cursor-pointer shadow-neon-sm">
                <HiOutlineCamera className="text-sm" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>

          {editing ? (
            <div className="w-full px-6 mt-4 space-y-2">
              <label className="text-[11px] text-gray-500">Full name</label>
              <input
                className="input input-sm w-full bg-base-800 border-base-700 text-gray-100"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <label className="text-[11px] text-gray-500">Bio</label>
              <textarea
                className="textarea textarea-sm w-full bg-base-800 border-base-700 text-gray-100"
                value={bio}
                maxLength={140}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-sm flex-1 bg-neon text-black border-none"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFullName(user?.fullName || "");
                    setBio(user?.bio || "");
                    setAvatarFile(null);
                    setPreview(null);
                  }}
                  className="btn btn-sm flex-1 bg-base-800 border-base-700 text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-4 font-semibold text-lg text-gray-100">{user?.fullName}</h2>
              <p className="text-xs text-gray-400 px-6 text-center mt-1">{user?.bio}</p>
              {editable && (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 text-xs text-neon border border-neon/40 rounded-full px-3 py-1 hover:bg-neon/10"
                >
                  Edit Profile
                </button>
              )}
            </>
          )}
        </div>

        {!editable && (
          <div className="px-6 py-4 overflow-y-auto">
            <p className="text-sm font-medium text-gray-300 mb-2">Media</p>
            {media.length === 0 ? (
              <p className="text-xs text-gray-500">No shared media yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {media.slice(0, 9).map((m, i) => (
                  <img
                    key={i}
                    src={`${SERVER_URL}${m}`}
                    className="w-full aspect-square object-cover rounded-md border border-base-700"
                    alt="shared"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}