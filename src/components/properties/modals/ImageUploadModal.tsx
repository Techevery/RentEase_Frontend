import React, { useState } from 'react';
import Button from '../../ui/Button';
import { useUploadHouseImagesMutation, useUploadUnitImagesMutation } from '../../../redux/services/propertyApi';

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  loading?: boolean;
  title: string;
  id: string; 
  type: 'house' | 'unit'; 
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ 
  open, 
  onClose, 
  onUpload, 
  loading = false,  
  title,
  id,
  type
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Call both hooks unconditionally
  const [uploadHouseImages, { isLoading: isHouseLoading }] = useUploadHouseImagesMutation();
  const [uploadUnitImages, { isLoading: isUnitLoading }] = useUploadUnitImagesMutation();

  // Determine which mutation to use based on the type
  const uploadImages = type === 'house' ? uploadHouseImages : uploadUnitImages;
  const isLoading = type === 'house' ? isHouseLoading : isUnitLoading;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      try {
        await uploadImages({ id, images: selectedFiles }).unwrap(); // Call the mutation
        onUpload(selectedFiles);
        setSelectedFiles([]);
        setPreviews([]);
      } catch (error) {
        console.error('Failed to upload images:', error);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <Button variant="secondary" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center"
            />
            <p className="text-sm text-gray-500 mt-2">Select multiple images to upload</p>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose} disabled={loading || isLoading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpload} 
              disabled={selectedFiles.length === 0 || isLoading}
            >
              Upload Images
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;