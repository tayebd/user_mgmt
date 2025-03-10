'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useApiStore } from '@/state/api';
import { Company } from '@/types';
import Sidebar from '@/components/Sidebar';
import { toast } from 'sonner';

const CreateCompanyPage = () => {
  const router = useRouter();
  const { createCompany } = useApiStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<Partial<Company>>({
    name: '',
    address: '',
    website: '',
    phone: '',
    email: '',
    iconUrl: '',
    capabilities: '',
    descriptions: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const handleAddDescription = () => {
    setCompany({
      ...company,
      descriptions: [
        ...(company.descriptions || []),
        { id: Date.now(), language: 'en', text: '' }
      ]
    });
  };

  const handleDescriptionChange = (index: number, field: 'language' | 'text', value: string) => {
    const updatedDescriptions = [...(company.descriptions || [])];
    updatedDescriptions[index] = {
      ...updatedDescriptions[index],
      [field]: value
    };
    setCompany({ ...company, descriptions: updatedDescriptions });
  };

  const handleRemoveDescription = (index: number) => {
    const updatedDescriptions = (company.descriptions || []).filter((_, i) => i !== index);
    setCompany({ ...company, descriptions: updatedDescriptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company.name) {
      toast.error('Company name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createCompany(company);
      toast.success('Company created successfully');
      router.push('/companies/manage');
    } catch (error) {
      console.error('Failed to create company:', error);
      toast.error('Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create New Company</h1>
          <Button 
            variant="outline"
            onClick={() => router.push('/companies/manage')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Companies
          </Button>
        </div>
        
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={company.name || ''}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={company.address || ''}
                    onChange={handleChange}
                    placeholder="Enter company address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={company.website || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={company.phone || ''}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={company.email || ''}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                    type="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="iconUrl">Icon URL</Label>
                  <Input
                    id="iconUrl"
                    name="iconUrl"
                    value={company.iconUrl || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capabilities">Capabilities</Label>
                <Textarea
                  id="capabilities"
                  name="capabilities"
                  value={company.capabilities || ''}
                  onChange={handleChange}
                  placeholder="Enter company capabilities"
                  rows={3}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Descriptions</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddDescription}
                    className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus size={16} />
                    Add Description
                  </Button>
                </div>
                
                {(company.descriptions || []).map((desc, index) => (
                  <div key={desc.id || index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-md">
                    <div className="col-span-2">
                      <Label htmlFor={`language-${index}`}>Language</Label>
                      <Input
                        id={`language-${index}`}
                        value={desc.language || ''}
                        onChange={(e) => handleDescriptionChange(index, 'language', e.target.value)}
                        placeholder="en"
                      />
                    </div>
                    
                    <div className="col-span-9">
                      <Label htmlFor={`text-${index}`}>Description</Label>
                      <Textarea
                        id={`text-${index}`}
                        value={desc.text || ''}
                        onChange={(e) => handleDescriptionChange(index, 'text', e.target.value)}
                        placeholder="Enter company description"
                        rows={2}
                      />
                    </div>
                    
                    <div className="col-span-1 pt-8">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleRemoveDescription(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/companies/manage')}
                  className="flex items-center gap-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                >
                  {isSubmitting ? 'Creating...' : (
                    <>
                      <Save size={16} />
                      Create Company
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCompanyPage;
