import React, { useState, useEffect } from 'react';
import { useCompanyStore, useCompanies, useCompanyReviews } from '@/stores/company-store';
import { Company, Review } from '@/types';

const CompanyManagement = () => {
  const companies = useCompanies();
  const reviews = useCompanyReviews();
  const { fetchCompanies, createCompany, updateCompany, deleteCompany, createCompanyReview, fetchCompanyReviews } = useCompanyStore();
  const [newCompany, setNewCompany] = useState<Partial<Company>>({ descriptions: [], iconUrl: '' });
  const [editingCompany, setEditingCompany] = useState<Partial<Company> | null>(null);
  const [newReview, setNewReview] = useState<Partial<Review>>({ rating: 0, comment: '' });

  const handleCreateCompany = async () => {
    await createCompany({
      name: newCompany.name || '',
      description: newCompany.descriptions?.[0]?.text || '',
      website: newCompany.website || '',
      phone: newCompany.phone || '',
      address: newCompany.address || '',
      industry: '',
      size: ''
    });
    setNewCompany({});
  };

  const handleUpdateCompany = async (companyId: number | undefined, company: Partial<Company>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    if (!company.name) {
      throw new Error('Company name is required');
    }
    await updateCompany(companyId, {
      name: company.name,
      description: company.descriptions?.[0]?.text || '',
      website: company.website || '',
      phone: company.phone || '',
      address: company.address || '',
      industry: '',
      size: ''
    });
  };

  const handleDeleteCompany = async (companyId: number | undefined) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    await deleteCompany(companyId);
  };

  const handleCreateReview = async (companyId: number) => {
    await createCompanyReview(companyId, {
      rating: newReview.rating || 0,
      content: newReview.comment || '',
      title: 'Review',
      pros: [],
      cons: []
    });
    setNewReview({ rating: 0, comment: '' });
    fetchCompanyReviews(companyId);
  };

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div>
      <h1>Company Management</h1>
      <div>
        <h2>Create Company</h2>
        <input
          type="text"
          placeholder="Name"
          value={newCompany.name || ''}
          onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          value={newCompany.address || ''}
          onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Website"
          value={newCompany.website || ''}
          onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
        />
        <div>
          <h3>Descriptions</h3>
          {newCompany.descriptions?.map((desc, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Language"
                value={desc.language || ''}
                onChange={(e) => {
                  const updatedDescriptions = [...newCompany.descriptions!];
                  updatedDescriptions[index] = { ...desc, language: e.target.value };
                  setNewCompany({ ...newCompany, descriptions: updatedDescriptions });
                }}
              />
              <input
                type="text"
                placeholder="Description"
                value={desc.text || ''}
                onChange={(e) => {
                  const updatedDescriptions = [...newCompany.descriptions!];
                  updatedDescriptions[index] = { ...desc, text: e.target.value };
                  setNewCompany({ ...newCompany, descriptions: updatedDescriptions });
                }}
              />
              <button onClick={() => {
                const updatedDescriptions = newCompany.descriptions!.filter((_, i) => i !== index);
                setNewCompany({ ...newCompany, descriptions: updatedDescriptions });
              }}>Remove</button>
            </div>
          ))}
          <button onClick={() => {
            setNewCompany({ ...newCompany, descriptions: [...(newCompany.descriptions || []), { id: Date.now(), language: '', text: '' }] });
          }}>Add Description</button>
        </div>
        <input
          type="text"
          placeholder="Icon URL"
          value={newCompany.iconUrl || ''}
          onChange={(e) => setNewCompany({ ...newCompany, iconUrl: e.target.value })}
        />
        <button onClick={handleCreateCompany}>Create Company</button>
      </div>
      <div>
        <h2>Company List</h2>
        <ul>
          {companies.map((company) => (
            <li key={company.id}>
              {company.name} ({company.address})
              <button onClick={() => setEditingCompany(company)}>Edit</button>
              <button onClick={() => handleDeleteCompany(company.id)}>Delete</button>
              <button onClick={() => fetchCompanyReviews(company.id)}>View Reviews</button>
            </li>
          ))}
        </ul>
      </div>
      {editingCompany && (
        <div>
          <h2>Edit Company</h2>
          <input
            type="text"
            placeholder="Name"
            value={editingCompany.name || ''}
            onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            value={editingCompany.address || ''}
            onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
          />
          <input
            type="text"
            placeholder="Website"
            value={editingCompany.website || ''}
            onChange={(e) => setEditingCompany({ ...editingCompany, website: e.target.value })}
          />
          <input
            type="text"
            placeholder="Icon URL"
            value={editingCompany.iconUrl || ''}
            onChange={(e) => setEditingCompany({ ...editingCompany, iconUrl: e.target.value })}
          />
          <div>
            <h3>Descriptions</h3>
            {editingCompany.descriptions?.map((desc, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Language"
                  value={desc.language || ''}
                  onChange={(e) => {
                    const updatedDescriptions = [...editingCompany.descriptions!];
                    updatedDescriptions[index] = { ...desc, language: e.target.value };
                    setEditingCompany({ ...editingCompany, descriptions: updatedDescriptions });
                  }}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={desc.text || ''}
                  onChange={(e) => {
                    const updatedDescriptions = [...editingCompany.descriptions!];
                    updatedDescriptions[index] = { ...desc, text: e.target.value };
                    setEditingCompany({ ...editingCompany, descriptions: updatedDescriptions });
                  }}
                />
                <button onClick={() => {
                  const updatedDescriptions = editingCompany.descriptions!.filter((_, i) => i !== index);
                  setEditingCompany({ ...editingCompany, descriptions: updatedDescriptions });
                }}>Remove</button>
              </div>
            ))}
            <button onClick={() => {
              setEditingCompany({ ...editingCompany, descriptions: [...(editingCompany.descriptions || []), { id: Date.now(), language: '', text: '' }] });
            }}>Add Description</button>
          </div>
          <button onClick={() => handleUpdateCompany(editingCompany?.id, editingCompany)}>Update Company</button>
          <button onClick={() => setEditingCompany(null)}>Cancel</button>
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
        <button onClick={() => handleCreateReview(editingCompany?.id || 0)}>Add Review</button>
      </div>
    </div>
  );
};

export default CompanyManagement;
