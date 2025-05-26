import React, { useState, useEffect } from 'react';
import './Culture.css';

const Culture = () => {
  const [activeRegion, setActiveRegion] = useState('All');
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // Background images for hero section slideshow
  const backgroundImages = [
    'https://static.toiimg.com/photo/65546954.cms',
    'https://www.holidify.com/images/cmsuploads/compressed/cultural-tourism-india_20190807174822.jpg',
    'https://www.travelandleisure.com/thmb/bhAHRKPuHwKy3KUVpyL-TwbkRmI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/holi-festival-INDIACULTURE1017-b2ffcfe706b749cdabc2f1f0552dbdb0.jpg',
    'https://www.swantour.com/blogs/wp-content/uploads/2018/04/Religious-Tourism-in-India.jpg',
    'https://media.istockphoto.com/id/519330110/photo/tribal-dancers-of-india.jpg?s=612x612&w=0&k=20&c=2QVEuc6l3HGi5aFxBVF9pKPfa-sFUVLVzCNnHpeBrSQ=',
    'https://www.traveldailymedia.com/wp-content/uploads/2022/09/South-India-culture-1-1024x684.jpg'
  ];

  // Setup background image slideshow
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [backgroundImages.length]);

  const regions = [
    'All',
    'North India',
    'South India',
    'East India',
    'West India',
    'North East India',
    'Central India'
  ];

  const cultures = [
    {
      id: 1,
      name: 'Gond',
      region: 'Central India',
      location: 'Madhya Pradesh, Maharashtra, Chhattisgarh, Andhra Pradesh',
      image: 'https://www.indianetzone.com/photos_gallery/images/Gond_Tribe_1.jpg',
      population: '4 million+',
      languages: ['Gondi', 'Regional languages'],
      religion: 'Animistic beliefs with Hindu influences',
      description: 'One of the largest tribal groups in India, known for their distinctive art style and deep connection to nature.',
      traditions: ['Gond paintings with natural colors', 'Dharwa dance', 'Hunting rituals'],
      festivals: ['Keslapur Jatara', 'Madai Festival'],
      dress: 'Women wear colorful sarees with traditional jewelry, men wear dhoti and kurta',
      cuisine: 'Basi (fermented rice), Jhunka (gram flour preparation), Kusli (rice and pulse preparation)',
      famousPeople: ['Jangarh Singh Shyam (artist)'],
      colorScheme: '#8B4513'
    },
    {
      id: 2,
      name: 'Bhil',
      region: 'West India',
      location: 'Gujarat, Madhya Pradesh, Rajasthan, Maharashtra',
      image: 'https://www.indianetzone.com/photos_gallery/images/Bhil_Tribe_2.jpg',
      population: '4.5 million+',
      languages: ['Bhili', 'Regional languages'],
      religion: 'Mixture of Hinduism and Animism',
      description: 'One of India\'s oldest indigenous communities, with rich cultural heritage and talented archers.',
      traditions: ['Pithora painting', 'Ghoomar dance', 'Archery skills'],
      festivals: ['Bhagoria', 'Gal', 'Indal'],
      dress: 'Bright colored clothes with silver and brass ornaments',
      cuisine: 'Maize bread, Dal Bati, Kadhi',
      famousPeople: ['Khajan Singh (Arjuna Award winner)'],
      colorScheme: '#7B3F00'
    },
    {
      id: 3,
      name: 'Santhal',
      region: 'East India',
      location: 'Jharkhand, West Bengal, Odisha, Bihar',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Santal_tribal_woman_traditional_dress.jpg/330px-Santal_tribal_woman_traditional_dress.jpg',
      population: '6 million+',
      languages: ['Santali'],
      religion: 'Traditional Sari Dharma with animist beliefs',
      description: 'The third largest tribe in India with a rich cultural heritage, music and distinctive dance forms.',
      traditions: ['Karam dance', 'Sohrai painting', 'Flute music'],
      festivals: ['Karam festival', 'Sohrai', 'Baha'],
      dress: 'Women wear bright sarees with red borders, men wear dhoti',
      cuisine: 'Rice beer (Handia), Dhuska (fried rice cake), Putka (steamed rice flour dumplings)',
      famousPeople: ['Raghunath Murmu (inventor of Ol Chiki script)'],
      colorScheme: '#8F4000'
    },
    {
      id: 4,
      name: 'Todas',
      region: 'South India',
      location: 'Nilgiri Hills, Tamil Nadu',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Toda_people_traditional_dress.jpg/330px-Toda_people_traditional_dress.jpg',
      population: '1,500',
      languages: ['Toda language'],
      religion: 'Indigenous beliefs centered around the buffalo',
      description: 'A small pastoral tribe known for their unique barrel-vaulted architecture and embroidery skills.',
      traditions: ['Dairy ritual ceremonies', 'Buffalo sacrifice', 'Embroidery (Poothkuli)'],
      festivals: ['Siro Festival', 'Marvainolkedr ritual'],
      dress: 'Distinctive shawl called "Putukuli" with red, black and white embroidery',
      cuisine: 'Dairy products, rice, local vegetables',
      famousPeople: [],
      colorScheme: '#2E4600'
    },
    {
      id: 5,
      name: 'Nagas',
      region: 'North East India',
      location: 'Nagaland, parts of Manipur, Arunachal Pradesh, Assam',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Ao_Naga_woman_in_traditional_attire.jpg',
      population: '2 million+',
      languages: ['Various Tibeto-Burman languages', 'Over 30 different dialects'],
      religion: 'Christianity (majority), traditional animist beliefs',
      description: 'Collection of several tribes known for their warrior tradition, vibrant costumes and unique customs.',
      traditions: ['Head-hunting (historical)', 'Wood carving', 'Weaving'],
      festivals: ['Hornbill Festival', 'Moatsu', 'Sekrenyi'],
      dress: 'Colorful shawls with distinctive patterns identifying different tribes',
      cuisine: 'Axone (fermented soybean), smoked meat, bamboo shoot dishes',
      famousPeople: ['T. Ao (first Indian Olympic football captain)', 'Dr. Talimeren Ao'],
      colorScheme: '#990000'
    },
    {
      id: 6,
      name: 'Khasi',
      region: 'North East India',
      location: 'Meghalaya',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Khasi_women_in_jainsem.jpg',
      population: '1.4 million+',
      languages: ['Khasi'],
      religion: 'Christianity, traditional beliefs',
      description: 'Matrilineal society where the youngest daughter inherits property and children take their mother\'s surname.',
      traditions: ['Matrilineal inheritance', 'Khasi archery (Teer)', 'Living root bridges'],
      festivals: ['Shad Suk Mynsiem', 'Nongkrem Dance'],
      dress: 'Jainsem (women\'s dress), Jymphong (men\'s dress)',
      cuisine: 'Jadoh (red rice with pork), Tungrymbai (fermented soybean), Dohneiiong',
      famousPeople: ['Captain Keishing Clifford Nongrum (Mahavir Chakra)'],
      colorScheme: '#006600'
    },
    {
      id: 7,
      name: 'Banjara',
      region: 'Central India',
      location: 'Rajasthan, Madhya Pradesh, Andhra Pradesh, Karnataka',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Banjara_Woman.jpg',
      population: '5 million+',
      languages: ['Banjari', 'Lambadi', 'Regional languages'],
      religion: 'Hinduism with distinct tribal beliefs',
      description: 'Nomadic tribe known for their colorful costumes, intricate embroidery and vibrant culture.',
      traditions: ['Mirror work embroidery', 'Banjara dance', 'Silver jewelry'],
      festivals: ['Teej', 'Diwali', 'Holi'],
      dress: 'Women wear heavily embroidered clothes with mirror work and coins, elaborate jewelry',
      cuisine: 'Bati (baked wheat balls), Rabadi (milk dish), spicy curries',
      famousPeople: ['Lakshman Banjara (folk singer)'],
      colorScheme: '#CC0000'
    },
    {
      id: 8,
      name: 'Dongria Kondh',
      region: 'East India',
      location: 'Niyamgiri hills, Odisha',
      image: 'https://i.pinimg.com/originals/f1/c8/c6/f1c8c6f01f76b7b7c0d1004df7c6b8d7.jpg',
      population: '8,000+',
      languages: ['Kui language'],
      religion: 'Traditional animist beliefs, worship of Niyam Raja (mountain god)',
      description: 'Known as the "people of the hills", this tribe is famous for protecting their sacred mountain against mining companies.',
      traditions: ['Triangle motif art', 'Meriah ritual (historical)', 'Dongria shawls'],
      festivals: ['Niyam Raja festival', 'Meria festival'],
      dress: 'Distinctive shawls with triangle designs, women wear multiple rings pierced through the nose',
      cuisine: 'Mandia jau (ragi gruel), pineapples, jackfruit',
      famousPeople: [],
      colorScheme: '#704214'
    },
    {
      id: 9,
      name: 'Rabari',
      region: 'West India',
      location: 'Gujarat, Rajasthan',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Rabari_woman.jpg',
      population: '250,000+',
      languages: ['Gujarati', 'Rajasthani dialects'],
      religion: 'Hinduism',
      description: 'Nomadic pastoral community known for their distinctive embroidery, jewelry and camel breeding traditions.',
      traditions: ['Camel breeding', 'Mirror embroidery', 'Silver jewelry'],
      festivals: ['Janmashtami', 'Diwali', 'Holi'],
      dress: 'Women wear black wool skirts with embroidered blouses and veils, elaborate silver jewelry',
      cuisine: 'Bajra rotla (millet bread), buttermilk, milk-based dishes',
      famousPeople: [],
      colorScheme: '#000000'
    },
    {
      id: 10,
      name: 'Lepcha',
      region: 'North East India',
      location: 'Sikkim, Darjeeling, parts of Nepal and Bhutan',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Lepcha_woman.jpg',
      population: '80,000+',
      languages: ['Lepcha', 'Nepali'],
      religion: 'Buddhism, Bon, Mun (shamanic tradition)',
      description: 'Indigenous people of Sikkim with rich folklore and nature conservation traditions.',
      traditions: ['Cham dance', 'Weaving', 'Nature worship'],
      festivals: ['Namsoong', 'Losoong', 'Tendong Lho Rum Faat'],
      dress: 'Dumdyam (women\'s dress), Thokro-Dum (men\'s robe)',
      cuisine: 'Chi (millet beer), gundruk (fermented leafy vegetable), kinema (fermented soybean)',
      famousPeople: ['Prem Das Rai (first Lepcha MP)'],
      colorScheme: '#4B0082'
    },
    {
      id: 11,
      name: 'Warli',
      region: 'West India',
      location: 'Maharashtra, Gujarat',
      image: 'https://www.dsource.in/sites/default/files/resource/warli-painting-maharashtra/images/warli-tribe-5.jpg',
      population: '300,000+',
      languages: ['Varli language', 'Marathi'],
      religion: 'Animism, with Hindu influences',
      description: 'Known worldwide for their distinctive white-on-red tribal art which uses simple shapes to depict daily life.',
      traditions: ['Warli painting', 'Tarpa dance', 'Dhol dance'],
      festivals: ['Gawri festival', 'Diwali', 'Holi'],
      dress: 'Traditional clothing with Warli art motifs',
      cuisine: 'Nachni (finger millet) preparations, rice, forest produce',
      famousPeople: ['Jivya Soma Mashe (artist)'],
      colorScheme: '#8B0000'
    },
    {
      id: 12,
      name: 'Kutia Kondh',
      region: 'East India',
      location: 'Odisha',
      image: 'https://i.pinimg.com/originals/c1/24/9e/c1249e3ef148ec9fead7124b859e5351.jpg',
      population: '4,000+',
      languages: ['Kui language'],
      religion: 'Traditional tribal religion',
      description: 'Known for their distinct face tattoo traditions, particularly among women.',
      traditions: ['Face tattooing', 'Shifting cultivation', 'Herbal medicine'],
      festivals: ['Kedu', 'Jhakar'],
      dress: 'Traditional tribal clothing, women historically identified by facial tattoos',
      cuisine: 'Mandia jau (ragi gruel), foraged forest foods',
      famousPeople: [],
      colorScheme: '#556B2F'
    }
  ];

  const filterCultures = () => {
    let filtered = cultures;
    
    if (activeRegion !== 'All') {
      filtered = filtered.filter(culture => culture.region === activeRegion);
    }
    
    return filtered;
  };

  const openCultureModal = (culture) => {
    setSelectedCulture(culture);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCultureModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="culture-container">
      <div 
        className="culture-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${backgroundImages[currentBgIndex]}')`,
          transition: 'background-image 1.5s ease-in-out'
        }}
      >
        <div className="hero-background-indicators">
          {backgroundImages.map((_, index) => (
            <span 
              key={index} 
              className={`indicator-dot ${currentBgIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentBgIndex(index)}
            ></span>
          ))}
        </div>
        <div className="hero-content">
          <h1>Discover India's Cultural Tapestry</h1>
          <p>Explore the diverse tribes and cultural communities that make up India's rich heritage</p>
        </div>
      </div>

      <div className="region-filter">
        <h2>Explore by Region</h2>
        <div className="region-buttons">
          {regions.map(region => (
            <button 
              key={region} 
              className={activeRegion === region ? 'active' : ''}
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="culture-count">
        <h3>{filterCultures().length} Cultural Communities Found</h3>
      </div>

      <div className="cultures-grid">
        {filterCultures().map(culture => (
          <div 
            key={culture.id} 
            className="culture-card"
            onClick={() => openCultureModal(culture)}
          >
            <div className="culture-image">
              <img src={culture.image} alt={culture.name} />
              <div className="culture-region-tag" style={{backgroundColor: culture.colorScheme}}>
                {culture.region}
              </div>
            </div>
            <div className="culture-card-content">
              <h3>{culture.name}</h3>
              <p className="culture-location"><i className="location-icon">📍</i> {culture.location}</p>
              <div className="culture-highlights">
                <div className="highlight">
                  <span className="highlight-title">Population</span>
                  <span className="highlight-value">{culture.population}</span>
                </div>
                <div className="highlight">
                  <span className="highlight-title">Language</span>
                  <span className="highlight-value">{culture.languages[0]}</span>
                </div>
              </div>
              <p className="culture-description">{culture.description.substring(0, 100)}...</p>
              <button className="explore-culture-btn">Explore Culture</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedCulture && (
        <div className="culture-modal" onClick={closeCultureModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeCultureModal}>&times;</button>
            
            <div className="modal-header" style={{backgroundColor: selectedCulture.colorScheme + '22'}}>
              <img src={selectedCulture.image} alt={selectedCulture.name} />
              <div className="culture-title">
                <h2>{selectedCulture.name}</h2>
                <p className="culture-region"><span>{selectedCulture.region}</span></p>
                <p className="culture-location">{selectedCulture.location}</p>
              </div>
            </div>
            
            <div className="culture-stats">
              <div className="stat">
                <div className="stat-title">Population</div>
                <div className="stat-value">{selectedCulture.population}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Languages</div>
                <div className="stat-value">{selectedCulture.languages.join(', ')}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Religion</div>
                <div className="stat-value">{selectedCulture.religion}</div>
              </div>
            </div>
            
            <div className="culture-overview">
              <h3>About {selectedCulture.name} Culture</h3>
              <p>{selectedCulture.description}</p>
            </div>
            
            <div className="culture-details">
              <div className="detail-section">
                <h4>Traditions</h4>
                <ul>
                  {selectedCulture.traditions.map((tradition, index) => (
                    <li key={index}>{tradition}</li>
                  ))}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>Festivals</h4>
                <ul>
                  {selectedCulture.festivals.map((festival, index) => (
                    <li key={index}>{festival}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="culture-lifestyle">
              <div className="lifestyle-section">
                <h4>Traditional Dress</h4>
                <p>{selectedCulture.dress}</p>
              </div>
              
              <div className="lifestyle-section">
                <h4>Cuisine</h4>
                <p>{selectedCulture.cuisine}</p>
              </div>
            </div>
            
            {selectedCulture.famousPeople.length > 0 && (
              <div className="notable-people">
                <h4>Notable Personalities</h4>
                <ul>
                  {selectedCulture.famousPeople.map((person, index) => (
                    <li key={index}>{person}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="culture-preservation">
              <h4>Cultural Preservation</h4>
              <p>The preservation of {selectedCulture.name} culture faces challenges in the modern world. Efforts are being made by various organizations and the government to document, protect, and promote their unique traditions.</p>
            </div>
          </div>
        </div>
      )}

      <div className="culture-preservation-section">
        <h2>Preserving India's Cultural Heritage</h2>
        <p>India's cultural diversity is a treasure that needs protection and preservation. Learn about initiatives to safeguard indigenous knowledge and traditions.</p>
        <div className="preservation-cards">
          <div className="preservation-card">
            <div className="preservation-icon">📚</div>
            <h3>Documentation</h3>
            <p>Efforts to record languages, traditions, art forms, and cultural practices</p>
          </div>
          <div className="preservation-card">
            <div className="preservation-icon">🏫</div>
            <h3>Education</h3>
            <p>Programs to teach traditional skills to younger generations</p>
          </div>
          <div className="preservation-card">
            <div className="preservation-icon">🏆</div>
            <h3>Recognition</h3>
            <p>Formal acknowledgment of cultural practices through UNESCO and government programs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Culture; 