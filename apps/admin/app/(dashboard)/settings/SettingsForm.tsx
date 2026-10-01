'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, IconUpload, IconX } from '@repo/ui';
import { updateSiteSettingsAction } from './actions';

interface SettingsFormProps {
  initialSiteName: string;
  initialSiteDesc: string;
  initialLogoUrl: string;
  initialFacebook: string;
  initialDiscord: string;
}

export function SettingsForm({
  initialSiteName,
  initialSiteDesc,
  initialLogoUrl,
  initialFacebook,
  initialDiscord,
}: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl || null);

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  function removeLogoFile() {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    if (logoFile) {
      formData.set('logo_file', logoFile);
    }
    formData.set('logo_url', logoUrl);

    startTransition(async () => {
      const res = await updateSiteSettingsAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        if (res.logo_url) {
          setLogoUrl(res.logo_url);
          setLogoPreview(res.logo_url);
          setLogoFile(null);
        }
        setSuccess('Đã lưu cài đặt hệ thống thành công! Giao diện sẽ tự động cập nhật logo mới.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-950/80 border border-red-800 p-4 text-sm text-red-300 shadow-md font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-sm text-emerald-300 shadow-md font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Main Site Info */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-zinc-100">Thông tin chung website</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            label="Tên thương hiệu website"
            name="site_name"
            defaultValue={initialSiteName}
            placeholder="VD: Story Arch"
            required
          />

          <Textarea
            label="Mô tả SEO website"
            name="site_description"
            defaultValue={initialSiteDesc}
            placeholder="Mô tả ngắn gọn về trang web..."
            rows={3}
          />

          {/* Logo File Upload Box */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 font-mono">
              Ảnh Logo Website (Tải file ảnh từ máy tính)
            </label>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Preview Box */}
              <div className="w-24 h-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden relative group shadow-md">
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeLogoFile}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Xóa logo"
                    >
                      <IconX size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-zinc-600 font-mono text-center p-2">
                    Chưa có logo
                  </div>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className="flex-1 w-full border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-5 text-center bg-zinc-950/40 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  name="logo_file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1.5 pointer-events-none">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-md">
                    <IconUpload size={18} />
                  </div>
                  <p className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                    {logoFile ? `Đã chọn: ${logoFile.name}` : 'Bấm hoặc kéo thả để chọn file ảnh Logo mới'}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">Hỗ trợ định dạng PNG, JPG, WEBP, SVG</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-zinc-100">Liên kết mạng xã hội & Cộng đồng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Facebook Fanpage URL"
            name="facebook"
            defaultValue={initialFacebook}
            placeholder="https://facebook.com/your-fanpage"
          />

          <Input
            label="Discord Community URL"
            name="discord"
            defaultValue={initialDiscord}
            placeholder="https://discord.gg/your-invite"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="font-bold px-8 shadow-lg shadow-emerald-950"
        >
          Lưu tất cả cài đặt
        </Button>
      </div>
    </form>
  );
}
