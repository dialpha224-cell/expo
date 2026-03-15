import { useState, useRef } from "react";
import { API } from "../App";
import axios from "axios";
import { Button } from "./ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PhotoUploader = ({ 
  currentPhotoUrl, 
  onPhotoUploaded,
  uploadEndpoint,
  aspectRatio = "square", // square, portrait, landscape
  placeholder = "Ajouter une photo"
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhotoUrl);
  const fileInputRef = useRef(null);

  const getCloudinarySignature = async () => {
    try {
      const response = await axios.get(`${API}/cloudinary/signature`, {
        withCredentials: true,
        params: {
          upload_preset: "afrocrown_uploads",
          folder: "afrocrown"
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error getting signature:", error);
      throw error;
    }
  };

  const uploadToCloudinary = async (file) => {
    const { signature, timestamp, cloud_name, api_key } = await getCloudinarySignature();
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("api_key", api_key);
    formData.append("upload_preset", "afrocrown_uploads");
    formData.append("folder", "afrocrown");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      formData
    );

    return response.data.secure_url;
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez selectionner une image");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas depasser 5 Mo");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const photoUrl = await uploadToCloudinary(file);
      
      // Call the backend endpoint to save the photo URL
      if (uploadEndpoint) {
        await axios.put(uploadEndpoint, { photo_url: photoUrl }, { withCredentials: true });
      }
      
      setPreview(photoUrl);
      onPhotoUploaded && onPhotoUploaded(photoUrl);
      toast.success("Photo uploadee avec succes");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload");
      setPreview(currentPhotoUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPreview(null);
    onPhotoUploaded && onPhotoUploaded(null);
  };

  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]"
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        className={`relative ${aspectClasses[aspectRatio]} bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-colors`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm">Changer la photo</p>
              </div>
            </div>
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePhoto();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            ) : (
              <>
                <Upload className="h-10 w-10 mb-2" />
                <p className="text-sm text-center px-4">{placeholder}</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {uploading && (
        <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-white text-sm">Upload en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
