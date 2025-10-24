import React, { useState, useEffect } from 'react';
import { useOrganizationStore, useOrganizations, useOrganizationReviews } from '@/stores/organization-store';
import { Organization, Review } from '@/types';

const OrganizationManagement = () => {
  const organizations = useOrganizations();
  const reviews = useOrganizationReviews();
  const { fetchOrganizations, createOrganization, updateOrganization, deleteOrganization, createOrganizationReview, fetchOrganizationReviews } = useOrganizationStore();
  const [newOrganization, setNewOrganization] = useState<Partial<Organization>>({ descriptions: [], iconUrl: '' });
  const [editingOrganization, setEditingOrganization] = useState<Partial<Organization> | null>(null);
  const [newReview, setNewReview] = useState<Partial<Review>>({ rating: 0, comment: '' });

  const handleCreateOrganization = async () => {
    await createOrganization({
      name: newOrganization.name || '',
      description: newOrganization.descriptions?.[0]?.text || '',
      website: newOrganization.website || '',
      phone: newOrganization.phone || '',
      address: newOrganization.address || '',
      industry: '',
      size: ''
    });
    setNewOrganization({});
  };

  const handleUpdateOrganization = async (organizationId: number | undefined, organization: Partial<Organization>) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    if (!organization.name) {
      throw new Error('Organization name is required');
    }
    await updateOrganization(organizationId, {
      name: organization.name,
      description: organization.descriptions?.[0]?.text || '',
      website: organization.website || '',
      phone: organization.phone || '',
      address: organization.address || '',
      industry: '',
      size: ''
    });
  };

  const handleDeleteOrganization = async (organizationId: number | undefined) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }
    await deleteOrganization(organizationId);
  };

  const handleCreateReview = async (organizationId: number) => {
    await createOrganizationReview(organizationId, {
      rating: newReview.rating || 0,
      content: newReview.comment || '',
      title: 'Review',
      pros: [],
      cons: []
    });
    setNewReview({ rating: 0, comment: '' });
    fetchOrganizationReviews(organizationId);
  };

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return (
    <div>
      <h1>Organization Management</h1>
      <div>
        <h2>Create Organization</h2>
        <input
          type="text"
          placeholder="Name"
          value={newOrganization.name || ''}
          onChange={(e) => setNewOrganization({ ...newOrganization, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          value={newOrganization.address || ''}
          onChange={(e) => setNewOrganization({ ...newOrganization, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Website"
          value={newOrganization.website || ''}
          onChange={(e) => setNewOrganization({ ...newOrganization, website: e.target.value })}
        />
        <div>
          <h3>Descriptions</h3>
          {newOrganization.descriptions?.map((desc, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Language"
                value={desc.language || ''}
                onChange={(e) => {
                  const updatedDescriptions = [...newOrganization.descriptions!];
                  updatedDescriptions[index] = { ...desc, language: e.target.value };
                  setNewOrganization({ ...newOrganization, descriptions: updatedDescriptions });
                }}
              />
              <input
                type="text"
                placeholder="Description"
                value={desc.text || ''}
                onChange={(e) => {
                  const updatedDescriptions = [...newOrganization.descriptions!];
                  updatedDescriptions[index] = { ...desc, text: e.target.value };
                  setNewOrganization({ ...newOrganization, descriptions: updatedDescriptions });
                }}
              />
              <button onClick={() => {
                const updatedDescriptions = newOrganization.descriptions!.filter((_, i) => i !== index);
                setNewOrganization({ ...newOrganization, descriptions: updatedDescriptions });
              }}>Remove</button>
            </div>
          ))}
          <button onClick={() => {
            setNewOrganization({ ...newOrganization, descriptions: [...(newOrganization.descriptions || []), { id: Date.now(), language: '', text: '' }] });
          }}>Add Description</button>
        </div>
        <input
          type="text"
          placeholder="Icon URL"
          value={newOrganization.iconUrl || ''}
          onChange={(e) => setNewOrganization({ ...newOrganization, iconUrl: e.target.value })}
        />
        <button onClick={handleCreateOrganization}>Create Organization</button>
      </div>
      <div>
        <h2>Organization List</h2>
        <ul>
          {organizations.map((organization) => (
            <li key={organization.id}>
              {organization.name} ({organization.address})
              <button onClick={() => setEditingOrganization(organization)}>Edit</button>
              <button onClick={() => handleDeleteOrganization(organization.id)}>Delete</button>
              <button onClick={() => fetchOrganizationReviews(organization.id)}>View Reviews</button>
            </li>
          ))}
        </ul>
      </div>
      {editingOrganization && (
        <div>
          <h2>Edit Organization</h2>
          <input
            type="text"
            placeholder="Name"
            value={editingOrganization.name || ''}
            onChange={(e) => setEditingOrganization({ ...editingOrganization, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            value={editingOrganization.address || ''}
            onChange={(e) => setEditingOrganization({ ...editingOrganization, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Website"
            value={editingOrganization.website || ''}
            onChange={(e) => setEditingOrganization({ ...editingOrganization, website: e.target.value })}
          />
          <input
            type="text"
            placeholder="Icon URL"
            value={editingOrganization.iconUrl || ''}
            onChange={(e) => setEditingOrganization({ ...editingOrganization, iconUrl: e.target.value })}
          />
          <div>
            <h3>Descriptions</h3>
            {editingOrganization.descriptions?.map((desc, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Language"
                  value={desc.language || ''}
                  onChange={(e) => {
                    const updatedDescriptions = [...editingOrganization.descriptions!];
                    updatedDescriptions[index] = { ...desc, language: e.target.value };
                    setEditingOrganization({ ...editingOrganization, descriptions: updatedDescriptions });
                  }}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={desc.text || ''}
                  onChange={(e) => {
                    const updatedDescriptions = [...editingOrganization.descriptions!];
                    updatedDescriptions[index] = { ...desc, text: e.target.value };
                    setEditingOrganization({ ...editingOrganization, descriptions: updatedDescriptions });
                  }}
                />
                <button onClick={() => {
                  const updatedDescriptions = editingOrganization.descriptions!.filter((_, i) => i !== index);
                  setEditingOrganization({ ...editingOrganization, descriptions: updatedDescriptions });
                }}>Remove</button>
              </div>
            ))}
            <button onClick={() => {
              setEditingOrganization({ ...editingOrganization, descriptions: [...(editingOrganization.descriptions || []), { id: Date.now(), language: '', text: '' }] });
            }}>Add Description</button>
          </div>
          <button onClick={() => handleUpdateOrganization(editingOrganization?.id, editingOrganization)}>Update Organization</button>
          <button onClick={() => setEditingOrganization(null)}>Cancel</button>
        </div>
      )}
      {reviews.length > 0 && (
        <div>
          <h2>Reviews</h2>
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                <p>Rating: {review.rating}</p>
                <p>Comment: {review.comment}</p>
                <p>By: {review.user?.name || 'Unknown User'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h2>Add Review</h2>
        <input
          type="number"
          placeholder="Rating"
          value={newReview.rating || ''}
          onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Comment"
          value={newReview.comment || ''}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
        />
        <button onClick={() => handleCreateReview(editingOrganization?.id || 0)}>Add Review</button>
      </div>
    </div>
  );
};

export default OrganizationManagement;
