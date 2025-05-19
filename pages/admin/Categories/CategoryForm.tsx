import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const iconOptions = [
    { value: 'gift', label: 'Presente' },
    { value: 'flower', label: 'Flor' },
    { value: 'box', label: 'Caixa' },
    { value: 'plus', label: 'Adicional' },
  ];

  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditing) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setName(data.name);
          setSlug(data.slug);
          setIcon(data.icon || '');
          setImageUrl(data.image_url || '');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Erro ao carregar dados da categoria');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [id, isEditing]);
  
  // Generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    // Only auto-generate slug if we're creating a new category or if the slug field hasn't been manually edited
    if (!isEditing || slug === '') {
      setSlug(value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
      );
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !slug) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }
    
    setSaving(true);
    try {
      let uploadedImageUrl = imageUrl;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `category_${slug}_${Date.now()}.${fileExt}`;
        // Log para depuração
        console.log('Iniciando upload da imagem:', fileName, imageFile);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('categories')
          .upload(fileName, imageFile, { upsert: true });
        if (uploadError) {
          // Log e exibe erro detalhado
          console.error('Erro ao fazer upload da imagem:', uploadError.message);
          toast.error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          setSaving(false);
          return;
        }
        uploadedImageUrl = `${supabase.storage.from('categories').getPublicUrl(fileName).data.publicUrl}`;
        console.log('Upload realizado com sucesso. URL:', uploadedImageUrl);
      }
      let response;
      
      if (isEditing) {
        response = await supabase
          .from('categories')
          .update({ 
            name, 
            slug, 
            icon,
            image_url: uploadedImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        response = await supabase
          .from('categories')
          .insert({ name, slug, icon, image_url: uploadedImageUrl });
      }
      
      if (response.error) {
        console.error('Error saving category:', response.error);
        throw response.error;
      }
      
      toast.success(`Categoria ${isEditing ? 'atualizada' : 'criada'} com sucesso`);
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/admin/categories')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Carregando dados...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nome da categoria"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-da-categoria"
                  required
                />
                <p className="text-sm text-gray-500">
                  O slug é usado nas URLs e deve conter apenas letras minúsculas, números e hífens.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {iconOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Imagem</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={saving}
                />
                {(imageFile || imageUrl) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                    alt="Pré-visualização da imagem"
                    className="h-24 mt-2 rounded border object-contain"
                  />
                )}
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving && <span className="animate-spin mr-2">⏳</span>}
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar'} Categoria
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default CategoryForm;
