import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AssetGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState('');
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageSrc(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Asset Generator</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="image">Upload Image</Label>
          <Input 
            id="image" 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1"
          />
        </div>

        <div>
          <canvas 
            ref={canvasRef}
            className="border border-gray-200 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}