import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VillageFormTable = () => {
  const [villages, setVillages] = useState([]);
  const { slug } = useParams();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [formData, setFormData] = useState({
    district: '',
    district_link: '',
    tehsil: '',
    village: '',
    village_link: ''
  });

  const [showForm, setShowForm] = useState(false);

  // Fetch States on Mount
  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStates(data);
        } else {
          }
      })


      
  }, []);

  // Handle State Change
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedDistrict('');
    setDistricts([]);
    setSubdistricts([]);
    setFormData({ ...formData, district: '', tehsil: '', village: '' });

    if (stateId) {
      fetch(`/api/districts?state_id=${stateId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setDistricts(data.data);
          } else {
            setDistricts([]);
          }
        })
    }
  };

  // Handle District Change
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSubdistricts([]);
    setFormData({ ...formData, district: districtId, tehsil: '', village: '' });

    if (districtId) {
      fetch(`/api/subdistricts?district_id=${districtId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setSubdistricts(data.data);
          } else {
            setSubdistricts([]);
          }
        })
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddVillage = (e) => {
    e.preventDefault();
    if (formData.tehsil && formData.village) {
      setVillages([...villages, formData]);
      setFormData({
        district: '',
        district_link: '',
        tehsil: '',
        village: '',
        village_link: ''
      });
      setShowForm(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Add Village Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'   
          }}
        >
          Add Village
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <form onSubmit={handleAddVillage} style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {/* State Dropdown */}
          <select
            value={selectedState}
            onChange={handleStateChange}
            required
            style={{ padding: '10px', flex: '1' }}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          {/* District Dropdown */}
          {selectedState && (
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              required
              style={{ padding: '10px', flex: '1' }}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          )}

          {/* Subdistrict (Tehsil) Dropdown */}
          {selectedDistrict && (
            <select
              name="tehsil"
              value={formData.tehsil}
              onChange={handleChange}
              required
              style={{ padding: '10px', flex: '1' }}
            >
              <option value="">Select Sub-district (Tehsil)</option>
              {subdistricts.map((subdistrict) => (
                <option key={subdistrict.id} value={subdistrict.id}>
                  {subdistrict.name}
                </option>
              ))}
            </select>
          )}

          {/* Village Name Input */}
          <input
            type="text"
            name="village"
            placeholder="Village Name"
            value={formData.village}
            onChange={handleChange}
            required
            style={{ padding: '10px', flex: '1' }}
          />

          {/* Village Link Input */}
          <input
            type="text"
            name="village_link"
            placeholder="Village Link"
            value={formData.village_link}
            onChange={handleChange}
            style={{ padding: '10px', flex: '1' }}
          />

          {/* District Link Input */}
          <input
            type="text"
            name="district_link"
            placeholder="District Link"
            value={formData.district_link}
            onChange={handleChange}
            style={{ padding: '10px', flex: '1' }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28A745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </form>
      )}

      {/* Table Section */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>#</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Sub-district (Tehsil) Name</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>Village</th>
            <th style={{ border: '1px solid #ccc', padding: '10px' }}>District</th>
          </tr>
        </thead>
        <tbody>
          {villages.map((v, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>{v.tehsil}</td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {v.village_link ? (
                  <a href={v.village_link} target="_blank" rel="noreferrer">
                    {v.village}
                  </a>
                ) : (
                  v.village
                )}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                {v.district_link ? (
                  <a href={v.district_link} target="_blank" rel="noreferrer">
                    {v.district}
                  </a>
                ) : (
                  v.district
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VillageFormTable;