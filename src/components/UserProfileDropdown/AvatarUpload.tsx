import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import getFrontendLink from "../../constants/frontendlinks";
import { RiCameraLine, RiDeleteBinLine, RiUploadLine } from "react-icons/ri";
import "./AvatarUpload.scss";

interface AvatarUploadProps {
  currentAvatar: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${getFrontendLink()}/v1/profile/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        onAvatarUpdate(data.data.avatar);
        toast.success("Avatar uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload avatar");
        setPreviewUrl(currentAvatar); // Reset preview on error
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("An error occurred while uploading avatar");
      setPreviewUrl(currentAvatar); // Reset preview on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatar) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${getFrontendLink()}/v1/profile/avatar`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPreviewUrl("");
        onAvatarUpdate("");
        toast.success("Avatar removed successfully!");
      } else {
        toast.error(data.message || "Failed to remove avatar");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("An error occurred while removing avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.name || "User";
    return name
      .split(" ")
      .map((n: string) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" />
        ) : (
          <div className="avatar-placeholder">
            <span>{getInitials()}</span>
          </div>
        )}
        {isUploading && (
          <div className="upload-overlay">
            <div className="spinner" />
          </div>
        )}
      </div>

      <div className="avatar-actions">
        <button
          type="button"
          className="btn-upload"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {previewUrl ? (
            <>
              <RiCameraLine />
              Change Photo
            </>
          ) : (
            <>
              <RiUploadLine />
              Upload Photo
            </>
          )}
        </button>

        {previewUrl && (
          <button
            type="button"
            className="btn-remove"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <RiDeleteBinLine />
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <p className="avatar-help-text">
        Allowed formats: JPG, PNG, WebP. Max size: 5MB
      </p>
    </div>
  );
};

export default AvatarUpload;
