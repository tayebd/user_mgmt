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
import { Organization } from '@/types';
import Sidebar from '@/components/Sidebar';
import { toast } from 'sonner';

interface EditOrganizationFormProps {
  organizationId: string;
}

const EditOrganizationForm = ({ organizationId }: EditOrganizationFormProps) => {
  const parsedOrganizationId = parseInt(organizationId);
  const router = useRouter();
  const { updateOrganization, fetchOrganizationById } = useApiStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organization, setOrganization] = useState<Partial<Organization>>({
    id: parsedOrganizationId,
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
    const loadOrganization = async () => {
      try {
        setIsLoading(true);
        console.log(`Loading organization with ID: ${parsedOrganizationId}`);
        const organizationData = await fetchOrganizationById(parsedOrganizationId);
        console.log('Organization data loaded:', organizationData);
        
        // Ensure all fields are properly set with the loaded data
        setOrganization({
          id: organizationData.id,
          name: organizationData.name || '',
          address: organizationData.address || '',
          website: organizationData.website || '',
          phone: organizationData.phone || '',
          iconUrl: organizationData.iconUrl || organizationData.logo || '',
          logo: organizationData.logo || '',
          capabilities: organizationData.capabilities || '',
          established: organizationData.established ? new Date(organizationData.established) : new Date(),
          badge: organizationData.badge || '',
          rating: organizationData.rating || 0,
          // Ensure descriptions is an array
          descriptions: Array.isArray(organizationData.descriptions) ? organizationData.descriptions : [],
        });
      } catch (error) {
        console.error('Failed to fetch organization:', error);
        toast.error('Failed to load organization data');
      } finally {
        setIsLoading(false);
      }
    };

    if (parsedOrganizationId) {
      loadOrganization();
    }
  }, [parsedOrganizationId, fetchOrganizationById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrganization({ ...organization, [name]: value });
  };

  const handleAddDescription = () => {
    setOrganization({
      ...organization,
      descriptions: [
        ...(organization.descriptions || []),
        { id: Date.now(), language: 'en', text: '' },
      ],
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const descriptions = [...(organization.descriptions || [])];
    descriptions[index] = { ...descriptions[index], text: value };
    setOrganization({ ...organization, descriptions });
  };

  const handleRemoveDescription = (index: number) => {
    const descriptions = [...(organization.descriptions || [])];
    descriptions.splice(index, 1);
    setOrganization({ ...organization, descriptions });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateOrganization(parsedOrganizationId, organization);
      toast.success('Organization updated successfully');
      router.push('/organizations/manage');
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error('Failed to update organization');
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
              <h1 className="text-2xl font-bold">Edit Organization</h1>
              <Button
                variant="outline"
                onClick={() => router.push('/organizations/manage')}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Organizations
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={organization.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={organization.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={organization.website}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={organization.phone}
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
                    value={organization.email || ''}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="iconUrl">Icon URL</Label>
                  <Input
                    id="iconUrl"
                    name="iconUrl"
                    value={organization.iconUrl}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="capabilities">Capabilities</Label>
                  <Textarea
                    id="capabilities"
                    name="capabilities"
                    value={organization.capabilities}
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
                    {organization.descriptions?.map((description, index) => (
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

export default EditOrganizationForm;
