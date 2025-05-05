import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Plus, Trash, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  fetchDeliveryTimeSlots, 
  createDeliveryTimeSlot, 
  updateDeliveryTimeSlot,
  deleteDeliveryTimeSlot
} from '@/services/api';

type StoreSettings = Database['public']['Tables']['store_settings']['Row'];
type DeliveryTimeSlot = Database['public']['Tables']['delivery_time_slots']['Row'];

const Settings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlotLoading, setTimeSlotLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    name: '',
    start_time: '',
    end_time: '',
    active: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .single();
          
        if (error) throw error;
        setSettings(data);
        
        // Fetch delivery time slots
        loadDeliveryTimeSlots();
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);
  
  const loadDeliveryTimeSlots = async () => {
    setTimeSlotLoading(true);
    try {
      const slots = await fetchDeliveryTimeSlots();
      setDeliveryTimeSlots(slots);
    } catch (error) {
      console.error('Error loading delivery time slots:', error);
      toast.error('Erro ao carregar horários de entrega');
    } finally {
      setTimeSlotLoading(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };
  
  const handleTimeSlotChange = (
    id: string, 
    field: keyof DeliveryTimeSlot, 
    value: any
  ) => {
    setDeliveryTimeSlots(slots => 
      slots.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };
  
  const handleNewTimeSlotChange = (field: string, value: any) => {
    setNewTimeSlot(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddTimeSlot = async () => {
    if (!newTimeSlot.name || !newTimeSlot.start_time || !newTimeSlot.end_time) {
      toast.error('Preencha todos os campos do horário de entrega');
      return;
    }
    
    setTimeSlotLoading(true);
    try {
      const result = await createDeliveryTimeSlot(newTimeSlot);
      
      if (result) {
        setDeliveryTimeSlots([...deliveryTimeSlots, result]);
        toast.success('Horário de entrega adicionado com sucesso');
        
        // Reset form
        setNewTimeSlot({
          name: '',
          start_time: '',
          end_time: '',
          active: true
        });
      }
    } catch (error: any) {
      console.error('Error adding time slot:', error);
      toast.error('Erro ao adicionar horário de entrega. Tente novamente.');
    } finally {
      setTimeSlotLoading(false);
    }
  };
  
  const handleSaveTimeSlots = async () => {
    setTimeSlotLoading(true);
    try {
      // Update all time slots
      for (const slot of deliveryTimeSlots) {
        await updateDeliveryTimeSlot(slot.id, slot);
      }
      
      toast.success('Horários de entrega salvos com sucesso');
    } catch (error) {
      console.error('Error saving time slots:', error);
      toast.error('Erro ao salvar horários de entrega');
    } finally {
      setTimeSlotLoading(false);
    }
  };
  
  const handleDeleteTimeSlot = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário de entrega?')) {
      return;
    }
    
    setTimeSlotLoading(true);
    try {
      const success = await deleteDeliveryTimeSlot(id);
      
      if (success) {
        setDeliveryTimeSlots(slots => slots.filter(slot => slot.id !== id));
        toast.success('Horário de entrega excluído com sucesso');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast.error('Erro ao excluir horário de entrega');
    } finally {
      setTimeSlotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_settings')
        .update(settings)
        .eq('id', settings.id);
        
      if (error) throw error;
      
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout requiredRole="editor">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout requiredRole="editor">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-bold">Configurações não encontradas</h2>
            <p className="mt-2">Não foi possível carregar as configurações da loja.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout requiredRole="editor">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Salvando...' : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="delivery">Horários de Entrega</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Loja</Label>
              <Input
                id="name"
                value={settings.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                value={settings.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                className="mt-1"
                placeholder="https://exemplo.com/logo.png"
              />
              {settings.logo_url && (
                <div className="mt-2">
                  <img 
                    src={settings.logo_url} 
                    alt="Logo Preview" 
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      toast.error('Não foi possível carregar a imagem');
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
              <Input
                id="whatsapp_number"
                value={settings.whatsapp_number || ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className="mt-1"
                placeholder="5511999999999"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: código do país + DDD + número (ex: 5511999999999)
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pix_enabled" className="text-base">Pagamento via PIX</Label>
                <p className="text-sm text-gray-500">
                  Ative para permitir pagamentos via PIX
                </p>
              </div>
              <Switch
                id="pix_enabled"
                checked={settings.pix_enabled || false}
                onCheckedChange={(checked) => handleChange('pix_enabled', checked)}
              />
            </div>

            {settings.pix_enabled && (
              <div className="pt-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  value={settings.pix_key || ''}
                  onChange={(e) => handleChange('pix_key', e.target.value)}
                  className="mt-1"
                  placeholder="CPF, CNPJ, E-mail, Celular ou Chave aleatória"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Será usada para gerar o QR code de pagamento
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Cores Primárias</h3>
              
              <div>
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primary_color"
                    value={settings.primary_color || '#f5c6d0'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                  />
                  <input 
                    type="color" 
                    value={settings.primary_color || '#f5c6d0'} 
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="primary_text_color">Texto Primário</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primary_text_color"
                    value={settings.primary_text_color || '#a62c47'}
                    onChange={(e) => handleChange('primary_text_color', e.target.value)}
                  />
                  <input 
                    type="color" 
                    value={settings.primary_text_color || '#a62c47'} 
                    onChange={(e) => handleChange('primary_text_color', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Cores Secundárias</h3>
              
              <div>
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secondary_color"
                    value={settings.secondary_color || '#eaf3c7'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                  />
                  <input 
                    type="color" 
                    value={settings.secondary_color || '#eaf3c7'} 
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary_text_color">Texto Secundário</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secondary_text_color"
                    value={settings.secondary_text_color || '#3e6522'}
                    onChange={(e) => handleChange('secondary_text_color', e.target.value)}
                  />
                  <input 
                    type="color" 
                    value={settings.secondary_text_color || '#3e6522'} 
                    onChange={(e) => handleChange('secondary_text_color', e.target.value)}
                    className="w-12 h-10 p-1 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-md border">
            <h3 className="font-medium mb-4">Visualização</h3>
            
            <div className="flex flex-wrap gap-4">
              <div 
                className="p-4 rounded-md text-center" 
                style={{
                  backgroundColor: settings.primary_color || '#f5c6d0',
                  color: settings.primary_text_color || '#a62c47'
                }}
              >
                <p className="font-bold">Cor Primária</p>
                <p>Exemplo de texto</p>
              </div>
              
              <div 
                className="p-4 rounded-md text-center" 
                style={{
                  backgroundColor: settings.secondary_color || '#eaf3c7',
                  color: settings.secondary_text_color || '#3e6522'
                }}
              >
                <p className="font-bold">Cor Secundária</p>
                <p>Exemplo de texto</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="delivery" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Faixas de Horário de Entrega
              </h3>
              
              <Button 
                onClick={handleSaveTimeSlots} 
                variant="outline" 
                size="sm"
                disabled={timeSlotLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Horários
              </Button>
            </div>
            
            <div className="space-y-4">
              {deliveryTimeSlots.map(slot => (
                <div key={slot.id} className="border p-4 rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-${slot.id}`}
                        checked={slot.active || false}
                        onCheckedChange={(checked) => 
                          handleTimeSlotChange(slot.id, 'active', checked)
                        }
                      />
                      <Label htmlFor={`active-${slot.id}`}>
                        {slot.active ? 'Ativo' : 'Inativo'}
                      </Label>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTimeSlot(slot.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`name-${slot.id}`}>Nome</Label>
                      <Input
                        id={`name-${slot.id}`}
                        value={slot.name}
                        onChange={(e) => 
                          handleTimeSlotChange(slot.id, 'name', e.target.value)
                        }
                        placeholder="Ex: Manhã"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`start-${slot.id}`}>Horário Início</Label>
                      <Input
                        id={`start-${slot.id}`}
                        value={slot.start_time}
                        onChange={(e) => 
                          handleTimeSlotChange(slot.id, 'start_time', e.target.value)
                        }
                        placeholder="Ex: 09:00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`end-${slot.id}`}>Horário Fim</Label>
                      <Input
                        id={`end-${slot.id}`}
                        value={slot.end_time}
                        onChange={(e) => 
                          handleTimeSlotChange(slot.id, 'end_time', e.target.value)
                        }
                        placeholder="Ex: 12:00"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {deliveryTimeSlots.length === 0 && !timeSlotLoading && (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">Nenhum horário cadastrado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Adicione horários de entrega abaixo
                  </p>
                </div>
              )}
              
              {timeSlotLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
            </div>
            
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Adicionar Novo Horário</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="new-name">Nome</Label>
                  <Input
                    id="new-name"
                    value={newTimeSlot.name}
                    onChange={(e) => 
                      handleNewTimeSlotChange('name', e.target.value)
                    }
                    placeholder="Ex: Manhã"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-start">Horário Início</Label>
                  <Input
                    id="new-start"
                    value={newTimeSlot.start_time}
                    onChange={(e) => 
                      handleNewTimeSlotChange('start_time', e.target.value)
                    }
                    placeholder="Ex: 09:00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-end">Horário Fim</Label>
                  <Input
                    id="new-end"
                    value={newTimeSlot.end_time}
                    onChange={(e) => 
                      handleNewTimeSlotChange('end_time', e.target.value)
                    }
                    placeholder="Ex: 12:00"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddTimeSlot} 
                    className="w-full"
                    disabled={timeSlotLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Settings;
