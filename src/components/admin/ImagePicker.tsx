import { useState, useEffect } from 'react';
import { X, Search, Upload, Link as LinkIcon, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImagePickerProps {
  onSelect: (imageUrl: string, imageData?: any) => void;
  onClose: () => void;
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
}

export default function ImagePicker({ onSelect, onClose }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<'pexels' | 'upload' | 'url'>('pexels');
  const [searchQuery, setSearchQuery] = useState('');
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY';

  const searchPexels = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPexelsPhotos(data.photos || []);
      } else {
        console.error('Pexels API error:', response.status);
        setPexelsPhotos([]);
      }
    } catch (error) {
      console.error('Error fetching from Pexels:', error);
      setPexelsPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { data: mediaData, error: mediaError } = await supabase
          .from('media_library')
          .insert({
            filename: fileName,
            original_filename: file.name,
            file_path: filePath,
            file_url: objectUrl,
            file_type: file.type,
            file_size: file.size,
            width: img.width,
            height: img.height,
            source: 'upload',
          })
          .select()
          .single();

        if (mediaError) throw mediaError;

        setUploadProgress(100);
        onSelect(objectUrl, mediaData);
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onSelect(imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Insert Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('pexels')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'pexels'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ImageIcon size={18} />
              <span>Pexels Library</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload size={18} />
              <span>Upload Image</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LinkIcon size={18} />
              <span>Image URL</span>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'pexels' && (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPexels(searchQuery)}
                    placeholder="Search free images on Pexels..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => searchPexels(searchQuery)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-600" size={40} />
                </div>
              ) : pexelsPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pexelsPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => onSelect(photo.src.large, photo)}
                      className="relative aspect-square rounded-lg overflow-hidden group hover:ring-4 hover:ring-blue-500 transition-all"
                    >
                      <img
                        src={photo.src.medium}
                        alt={`Photo by ${photo.photographer}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-end">
                        <div className="p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          by {photo.photographer}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Search for images from Pexels</p>
                  <p className="text-sm mt-1">All images are free to use</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Upload size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload an Image
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click to select a file from your computer
                </p>
                <div className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Choose File
                </div>
              </label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-6 w-full max-w-md">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Maximum file size: 5MB • Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <LinkIcon size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Insert Image URL
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Paste the URL of an image from the web
              </p>
              <div className="w-full max-w-2xl">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl.trim()}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
