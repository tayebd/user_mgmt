import React, { useState, useEffect } from 'react';
import { useApiStore } from '@/state/api';
import { Company } from '@/types';

const CompanyManagement = () => {
  const { companies, fetchCompanies, createCompany, updateCompany, deleteCompany } = useApiStore();
  const [newCompany, setNewCompany] = useState<Partial<Company>>({});
  const [editingCompany, setEditingCompany] = useState<Partial<Company> | null>(null);

  const handleCreateCompany = async () => {
    await createCompany(newCompany);
    setNewCompany({});
  };

  const handleUpdateCompany = async () => {
    if (editingCompany) {
      await updateCompany(editingCompany.id!, editingCompany);
      setEditingCompany(null);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    await deleteCompany(companyId);
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
          <button onClick={handleUpdateCompany}>Update Company</button>
          <button onClick={() => setEditingCompany(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
