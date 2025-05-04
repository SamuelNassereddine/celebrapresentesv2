
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import {
  createSpecialItem,
  updateSpecialItem,
  uploadProductImage
} from '@/services/api';
import { Database } from '@/integrations/supabase/types';

import AdminLayout from '../AdminLayout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';

type SpecialItem = Database['public']['Tables']['special_items']['Row'];

const formSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().positive('O preço deve ser maior que zero'),
  image_url: z.string().min(1, 'A imagem é obrigatória'),
});

type FormValues = z.infer<typeof formSchema>;

const SpecialItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      image_url: '',
    },
  });

  useEffect(() => {
    const fetchSpecialItem = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('special_items')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.reset({
            title: data.title,
            description: data.description || '',
            price: Number(data.price),
            image_url: data.image_url,
          });
        }
      } catch (error) {
        console.error('Error fetching special item:', error);
        toast.error('Erro ao carregar item especial');
        navigate('/admin/special-items');
      }
    };
    
    if (isEditing) {
      fetchSpecialItem();
    }
  }, [id, isEditing, form, navigate]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    
    try {
      if (isEditing && id) {
        const updated = await updateSpecialItem(id, values);
        if (updated) {
          toast.success('Item especial atualizado com sucesso');
        } else {
          throw new Error('Erro ao atualizar item especial');
        }
      } else {
        const created = await createSpecialItem(values);
        if (created) {
          toast.success('Item especial criado com sucesso');
          form.reset();
        } else {
          throw new Error('Erro ao criar item especial');
        }
      }
      
      navigate('/admin/special-items');
    } catch (error) {
      console.error('Error saving special item:', error);
      toast.error('Erro ao salvar item especial');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    setImageUploading(true);
    
    try {
      const imageUrl = await uploadProductImage(file);
      
      if (imageUrl) {
        form.setValue('image_url', imageUrl);
        toast.success('Imagem carregada com sucesso');
      } else {
        throw new Error('Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <AdminLayout requiredRole="editor">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Item Especial' : 'Novo Item Especial'}
        </h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do item especial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do item especial" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem</FormLabel>
                  <div className="space-y-4">
                    {field.value && (
                      <div className="border rounded-md overflow-hidden max-w-xs">
                        <img 
                          src={field.value} 
                          alt="Preview" 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <FormControl>
                        <Input 
                          type="hidden" 
                          {...field} 
                        />
                      </FormControl>
                      
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={imageUploading}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          disabled={imageUploading}
                        >
                          {imageUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              <span>Carregar imagem</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin/special-items')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Atualizar' : 'Criar'}</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default SpecialItemForm;
