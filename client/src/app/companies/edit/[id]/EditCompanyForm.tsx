'use client';

import React, { useState, useEffect } from 'react';
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

interface EditCompanyFormProps {
  companyId: string;
}

const EditCompanyForm = ({ companyId }: EditCompanyFormProps) => {
  const parsedCompanyId = parseInt(companyId);
  const router = useRouter();
  const { updateCompany, fetchCompanyById } = useApiStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<Partial<Company>>({
    id: parsedCompanyId,
    name: '',
    address: '',
    website: '',
    phone: '',
    email: '',
    iconUrl: '',
    capabilities: '',
    descriptions: [],
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setIsLoading(true);
        console.log(`Loading company with ID: ${parsedCompanyId}`);
        const companyData = await fetchCompanyById(parsedCompanyId);
        console.log('Company data loaded:', companyData);
        
        // Ensure all fields are properly set with the loaded data
        setCompany({
          id: companyData.id,
          name: companyData.name || '',
          address: companyData.address || '',
          website: companyData.website || '',
          phone: companyData.phone || '',
          iconUrl: companyData.iconUrl || companyData.logo || '',
          logo: companyData.logo || '',
          capabilities: companyData.capabilities || '',
          established: companyData.established ? new Date(companyData.established) : new Date(),
          badge: companyData.badge || '',
          rating: companyData.rating || 0,
          // Ensure descriptions is an array
          descriptions: Array.isArray(companyData.descriptions) ? companyData.descriptions : [],
        });
      } catch (error) {
        console.error('Failed to fetch company:', error);
        toast.error('Failed to load company data');
      } finally {
        setIsLoading(false);
      }
    };

    if (parsedCompanyId) {
      loadCompany();
    }
  }, [parsedCompanyId, fetchCompanyById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const handleAddDescription = () => {
    setCompany({
      ...company,
      descriptions: [
        ...(company.descriptions || []),
        { id: Date.now(), language: 'en', text: '' },
      ],
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const descriptions = [...(company.descriptions || [])];
    descriptions[index] = { ...descriptions[index], text: value };
    setCompany({ ...company, descriptions });
  };

  const handleRemoveDescription = (index: number) => {
    const descriptions = [...(company.descriptions || [])];
    descriptions.splice(index, 1);
    setCompany({ ...company, descriptions });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateCompany(parsedCompanyId, company);
      toast.success('Company updated successfully');
      router.push('/companies/manage');
    } catch (error) {
      console.error('Failed to update company:', error);
      toast.error('Failed to update company');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 ml-64">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar />
      <div className="p-4 ml-64">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Edit Company</h1>
              <Button
                variant="outline"
                onClick={() => router.push('/companies/manage')}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Companies
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={company.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={company.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={company.website}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={company.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={company.email || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="iconUrl">Icon URL</Label>
                  <Input
                    id="iconUrl"
                    name="iconUrl"
                    value={company.iconUrl}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="capabilities">Capabilities</Label>
                  <Textarea
                    id="capabilities"
                    name="capabilities"
                    value={company.capabilities}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Descriptions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddDescription}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Description
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {company.descriptions?.map((description, index) => (
                      <div key={description.id} className="flex gap-2">
                        <Textarea
                          value={description.text}
                          onChange={(e) =>
                            handleDescriptionChange(index, e.target.value)
                          }
                          placeholder={`Description ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveDescription(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save size={16} />
                      Save Changes
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

export default EditCompanyForm;
