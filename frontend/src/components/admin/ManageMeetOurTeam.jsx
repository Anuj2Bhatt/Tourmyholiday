import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import './ManageMeetOurTeam.css';

const emptyMember = {
  name: '',
  role: '',
  description: '',
  image: '',
  linkedin: ''
};

const ManageMeetOurTeam = () => {
  const [team, setTeam] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [member, setMember] = useState(emptyMember);
  const [editingIndex, setEditingIndex] = useState(null);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/team')
      .then(res => res.json())
      .then(data => setTeam(data))
      .catch(() => setTeam([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
    if (name === 'linkedin') {
      if (value && !value.startsWith('https://www.linkedin.com/')) {
        setLinkError('Please enter a valid LinkedIn profile link (must start with https://www.linkedin.com/)');
      } else {
        setLinkError('');
      }
    }
  };

  const handleImageChange = e => {
    setMember({ ...member, image: e.target.files[0] });
  };

  const handleAdd = () => {
    setMember(emptyMember);
    setEditingIndex(null);
    setShowForm(true);
    setLinkError('');
  };

  const handleEdit = idx => {
    setMember(team[idx]);
    setEditingIndex(idx);
    setShowForm(true);
    setLinkError('');
  };

  const handleDelete = async idx => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    const id = team[idx].id;
    await fetch(`http://localhost:5000/api/team/${id}`, { method: 'DELETE' });
    setTeam(team.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (member.linkedin && !member.linkedin.startsWith('https://www.linkedin.com/')) {
        setLinkError('Please enter a valid LinkedIn profile link (must start with https://www.linkedin.com/)');
        return;
      }

      let imageUrl = member.image;
      if (member.image instanceof File) {
        try {
          const formData = new FormData();
          formData.append('featured_image', member.image);
          const res = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!res.ok) {
            throw new Error(`Image upload failed: ${res.statusText}`);
          }
          
          const data = await res.json();
          if (!data.images || data.images.length === 0) {
            throw new Error('No image URL received from server');
          }
          imageUrl = `http://localhost:5000/uploads/${data.images[0]}`;
        } catch (error) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      const memberData = { ...member, image: imageUrl };
      if (editingIndex !== null) {
        // Update
        const id = team[editingIndex].id;
        const updateRes = await fetch(`http://localhost:5000/api/team/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });

        if (!updateRes.ok) {
          throw new Error(`Update failed: ${updateRes.statusText}`);
        }

        const updated = [...team];
        updated[editingIndex] = { ...memberData, id };
        setTeam(updated);
      } else {
        // Add
        const addRes = await fetch('http://localhost:5000/api/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        });

        if (!addRes.ok) {
          throw new Error(`Add failed: ${addRes.statusText}`);
        }

        const newMember = await addRes.json();
        setTeam([...team, newMember]);
      }

      setShowForm(false);
      setMember(emptyMember);
      setEditingIndex(null);
      setLinkError('');
    } catch (error) {
      alert('Failed to save team member. Please try again.');
    }
  };

  return (
    <div>
      <div className="manage-team-topbar">
        <h2 style={{ margin: 0 }}>Manage Meet Our Team</h2>
        <button
          onClick={handleAdd}
          className="manage-team-add-btn"
        >
          <FaPlus /> Add New
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="manage-team-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Profile Image</th>
              <th>User Name</th>
              <th>Description</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m, idx) => (
              <tr key={m.id || idx}>
                <td>{idx + 1}</td>
                <td>
                  {m.image && (
                    <img src={m.image} alt={m.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e3f0fa' }} />
                  )}
                </td>
                <td>{m.name}</td>
                <td style={{ maxWidth: 220, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.description}</td>
                <td>
                  <button
                    onClick={() => handleEdit(idx)}
                    title="Edit"
                    className="manage-team-action-btn edit"
                  >
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(idx)}
                    title="Delete"
                    className="manage-team-action-btn delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="manage-team-modal-overlay">
          <form
            onSubmit={handleSave}
            className="manage-team-modal"
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="manage-team-modal-close"
              title="Close"
            >
              <FaTimes />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: 18 }}>{editingIndex !== null ? 'Edit' : 'Add'} Team Member</h3>
            <input
              name="name"
              value={member.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              name="role"
              value={member.role}
              onChange={handleChange}
              placeholder="Role"
              required
            />
            <textarea
              name="description"
              value={member.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
            <input
              name="linkedin"
              value={member.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn Profile Link (https://www.linkedin.com/...)"
              pattern="https://www.linkedin.com/.*"
              style={linkError ? { border: '1.5px solid #d32f2f' } : {}}
            />
            {linkError && <div style={{ color: '#d32f2f', fontSize: 13, marginBottom: 6 }}>{linkError}</div>}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {member.image && typeof member.image === 'string' && (
              <img src={member.image} alt="preview" className="manage-team-modal-preview" />
            )}
            <button
              type="submit"
              className="manage-team-modal-submit"
              disabled={!!linkError}
            >
              {editingIndex !== null ? 'Update' : 'Add'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageMeetOurTeam; 