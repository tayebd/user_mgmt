import React, { useState, useEffect } from 'react';
import { useApiStore } from '@/state/api';
import { Company, Review } from '@/types';

const CompanyManagement = () => {
  const { companies, fetchCompanies, createCompany, updateCompany, deleteCompany, createReview, fetchReviews } = useApiStore();
  const [newCompany, setNewCompany] = useState<Partial<Company>>({ descriptions: [], iconUrl: '' });
  const [editingCompany, setEditingCompany] = useState<Partial<Company> | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<Partial<Review>>({ rating: 0, comment: '' });

  const handleCreateCompany = async () => {
    await createCompany(newCompany);
    setNewCompany({});
  };

  const handleUpdateCompany = async (companyId: number | undefined, company: Partial<Company>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    if (!company.name) {
      throw new Error('Company name is required');
    }
    const updatedCompany: Company = {
      id: companyId,
      name: company.name,
      location: company.location || '',
      website: company.website || '',
      descriptions: company.descriptions || [],
      phone: company.phone || '',
      logo: company.logo || '',
      established: company.established || new Date(),
      badge: company.badge || '',
      rating: company.rating || 0,
    };
    await updateCompany(companyId, updatedCompany);
  };

  const handleDeleteCompany = async (companyId: number | undefined) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    await deleteCompany(companyId);
  };

  const handleCreateReview = async (companyId: number) => {
    await createReview(companyId, newReview);
    setNewReview({ rating: 0, comment: '' });
    fetchCompanyReviews(companyId);
  };

  const fetchCompanyReviews = async (companyId: number) => {
    const data = await fetchReviews(companyId);
    setReviews(data);
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
          placeholder="Location"
          value={newCompany.location || ''}
          onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
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
              {company.name} ({company.location})
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
            placeholder="Location"
            value={editingCompany.location || ''}
            onChange={(e) => setEditingCompany({ ...editingCompany, location: e.target.value })}
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
                <p>By: {review.user.name}</p>
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
