
import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, Upload, Image, FileImage } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { uploadProductImage, deleteProductImageFromStorage } from '@/services/api';

type Category = Database['public']['Tables']['categories']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];

interface ImagePreview {
  file: File;
  previewUrl: string;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Product fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  
  // Upload de novas imagens
  const [imageFiles, setImageFiles] = useState<ImagePreview[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);
  
  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Erro ao carregar categorias');
      }
    };
    
    fetchCategories();
  }, []);

  // Load product if editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditing) return;
      
      setLoading(true);
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) throw productError;
        
        if (product) {
          setTitle(product.title);
          setDescription(product.description || '');
          setPrice(String(product.price));
          setCategoryId(product.category_id || '');
          
          // Fetch images
          const { data: productImages, error: imagesError } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', id)
            .order('is_primary', { ascending: false });
            
          if (imagesError) throw imagesError;
          
          setImages(productImages || []);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Erro ao carregar dados do produto');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, isEditing]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const newPreviews: ImagePreview[] = [];
    
    newFiles.forEach(file => {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida.`);
        return;
      }
      
      // Check if the file size is less than 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. O tamanho máximo é 2MB.`);
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push({ file, previewUrl });
    });
    
    setImageFiles([...imageFiles, ...newPreviews]);
    
    // Clear the file input
    e.target.value = '';
  };
  
  const removeImageFile = (indexToRemove: number) => {
    setImageFiles(imageFiles.filter((_, index) => index !== indexToRemove));
    
    if (primaryImageIndex === indexToRemove) {
      setPrimaryImageIndex(null);
    } else if (primaryImageIndex !== null && primaryImageIndex > indexToRemove) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };
  
  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
  };
  
  const uploadImages = async (): Promise<ProductImage[]> => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImage(true);
    const uploadedImages: ProductImage[] = [];
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const { file } = imageFiles[i];
        
        const url = await uploadProductImage(file);
        
        if (url) {
          uploadedImages.push({
            id: '',
            product_id: id || '',
            url: url,
            is_primary: primaryImageIndex === i,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao fazer upload de imagens:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setUploadingImage(false);
    }
    
    return uploadedImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !price || !categoryId) {
      toast.error('Título, preço e categoria são obrigatórios');
      return;
    }
    
    const priceValue = parseFloat(price.replace(',', '.'));
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Preço deve ser um valor positivo');
      return;
    }
    
    setSaving(true);
    try {
      let productId = id;
      
      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update({ 
            title, 
            description, 
            price: priceValue, 
            category_id: categoryId,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) {
          console.error('Error updating product:', error);
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({ 
            title, 
            description, 
            price: priceValue, 
            category_id: categoryId 
          })
          .select();
          
        if (error) {
          console.error('Error creating product:', error);
          throw error;
        }
        
        productId = data?.[0]?.id;
      }
      
      // Faça upload das novas imagens
      if (imageFiles.length > 0 && productId) {
        const uploadedImages = await uploadImages();
        
        if (uploadedImages.length > 0) {
          // Insira as novas imagens no banco de dados
          const { error } = await supabase
            .from('product_images')
            .insert(uploadedImages.map(img => ({
              product_id: productId,
              url: img.url,
              is_primary: img.is_primary
            })));
            
          if (error) {
            console.error('Error inserting product images:', error);
            throw error;
          }
        }
      }
      
      toast.success(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso`);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddImage = async () => {
    // Esse método não é mais necessário, substituído por upload de arquivo
    setShowImageForm(false);
  };
  
  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Primeiro exclui a imagem do storage
      await deleteProductImageFromStorage(imageUrl);
      
      // Depois remove o registro do banco de dados
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
        
      if (error) throw error;
      
      setImages(images.filter(img => img.id !== imageId));
      toast.success('Imagem removida com sucesso');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erro ao remover imagem');
    }
  };
  
  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      // First, set all images as not primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id);
      
      // Then set the selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);
        
      if (error) throw error;
      
      // Update local state
      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      
      toast.success('Imagem principal definida com sucesso');
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Erro ao definir imagem principal');
    }
  };
  
  const [showImageForm, setShowImageForm] = useState(false);

  return (
    <AdminLayout requiredRole="editor">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/admin/products')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">Carregando dados...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título do produto"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrição do produto"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço *</Label>
                      <Input
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0,00"
                        type="text"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving || uploadingImage}>
                      {saving && <span className="animate-spin mr-2">⏳</span>}
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Atualizar' : 'Criar'} Produto
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Imagens</h3>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" type="button" className="flex items-center" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar imagens
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
              
              {/* Previews de novas imagens */}
              {imageFiles.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-500">Novas imagens para upload</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {imageFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-md overflow-hidden ${primaryImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="h-24 overflow-hidden">
                          <img 
                            src={file.previewUrl} 
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 flex justify-between items-center">
                          <Button
                            size="sm"
                            variant={primaryImageIndex === index ? "default" : "ghost"}
                            onClick={() => setPrimaryImage(index)}
                            className="text-xs"
                            type="button"
                          >
                            {primaryImageIndex === index ? 'Principal' : 'Definir como principal'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeImageFile(index)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Imagens existentes */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Imagens salvas</h4>
                
                {images.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Nenhuma imagem adicionada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {images.map(image => (
                      <div 
                        key={image.id} 
                        className={`border rounded-md overflow-hidden ${image.is_primary ? 'ring-2 ring-primary' : ''}`}
                      >
                        <img 
                          src={image.url} 
                          alt="Imagem do produto" 
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="p-3 flex justify-between items-center">
                          <div className="flex items-center">
                            {image.is_primary ? (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Principal</span>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleSetPrimaryImage(image.id)}
                              >
                                Definir como principal
                              </Button>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteImage(image.id, image.url)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
