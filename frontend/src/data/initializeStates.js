import stateTemplate from './stateTemplate';

const initializeStates = () => {
  const existingStates = localStorage.getItem('tourMyHolidayStates');
  if (!existingStates) return;

  const states = JSON.parse(existingStates);
  const initializedStates = states.map(state => {
    // Create a new state object with the template structure
    const newState = {
      ...stateTemplate,
      id: state.id || state.name.toLowerCase().replace(/\s+/g, '-'),
      name: state.name,
      emoji: state.emoji || '🏞️',
      description: state.description || '',
      image: state.image || '',
      capital: state.capital || '',
      metaTitle: state.metaTitle || state.name,
      metaDescription: state.metaDescription || state.description,
      metaKeywords: state.metaKeywords || [state.name, 'tourism', 'travel'],
      sections: {
        history: {
          title: 'History',
          cards: state.sections?.history?.cards || []
        },
        districts: {
          title: 'Districts',
          cards: state.sections?.districts?.cards || []
        },
        temples: {
          title: 'Temples',
          cards: state.sections?.temples?.cards || []
        },
        rituals: {
          title: 'Rituals',
          cards: state.sections?.rituals?.cards || []
        },
        touristDestinations: {
          title: 'Tourist Destinations',
          cards: state.sections?.touristDestinations?.cards || []
        },
        customSections: state.sections?.customSections || []
      },
      packages: state.packages || []
    };

    // Add state-specific content
    if (state.name === 'Himachal Pradesh') {
      newState.capital = 'Shimla';
      newState.sections.touristDestinations.cards = [
        {
          title: 'Shimla',
          description: 'The capital city of Himachal Pradesh, known for its colonial architecture and scenic beauty.',
          image: '/images/gallery/shimla.jpg'
        },
        {
          title: 'Manali',
          description: 'A popular hill station known for adventure sports and beautiful landscapes.',
          image: '/images/gallery/manali.jpg'
        },
        {
          title: 'Dharamshala',
          description: 'Home to the Dalai Lama and known for its Tibetan culture and scenic beauty.',
          image: '/images/gallery/dharamshala.jpg'
        }
      ];
    } else if (state.name === 'Uttarakhand') {
      // Migrate Uttarakhand's existing content
      newState.capital = 'Dehradun';
      newState.sections.history.cards = [
        {
          title: 'Ancient History',
          date: '3000 BCE - 1200 CE',
          description: 'Uttarakhand finds mention in the ancient Hindu scriptures as Kedarkhand (present-day Garhwal) and Manaskhand (present-day Kumaon).'
        },
        {
          title: 'Medieval Period',
          date: '1200 CE - 1800 CE',
          description: 'During the medieval period, the region was ruled by various dynasties including the Katyuris, the Chand Kings, and the Gorkhas.'
        },
        {
          title: 'Modern History',
          date: '1800 CE - Present',
          description: "After India's independence, Uttarakhand became part of Uttar Pradesh. The demand for a separate state gained momentum in the 1990s, leading to the formation of Uttarakhand in 2000."
        }
      ];

      newState.sections.districts.cards = [
        {
          name: 'Dehradun',
          description: 'The capital city of Uttarakhand. Known for its educational institutions and scenic beauty.'
        },
        {
          name: 'Haridwar',
          description: 'One of the seven holiest places in Hinduism. Famous for the Kumbh Mela and Ganga Aarti.'
        },
        {
          name: 'Nainital',
          description: 'Famous for its beautiful lake and surrounding hills. A popular tourist destination.'
        }
      ];

      newState.sections.customSections = [
        {
          title: 'Char Dham Yatra',
          cards: [
            {
              title: 'Yamunotri',
              description: 'The source of the Yamuna River and the seat of the goddess Yamuna.'
            },
            {
              title: 'Gangotri',
              description: 'The origin of the Ganges River and the seat of the goddess Ganga.'
            },
            {
              title: 'Kedarnath',
              description: 'One of the twelve Jyotirlingas, dedicated to Lord Shiva.'
            },
            {
              title: 'Badrinath',
              description: 'Dedicated to Lord Vishnu, located along the Alaknanda River.'
            }
          ]
        },
        {
          title: 'Panch Kedar',
          cards: [
            {
              title: 'Kedarnath',
              description: 'The most important temple among the Panch Kedar.'
            },
            {
              title: 'Tungnath',
              description: 'The highest Shiva temple in the world at 3,680 meters.'
            },
            {
              title: 'Rudranath',
              description: 'Dedicated to the face of Lord Shiva.'
            },
            {
              title: 'Madhyamaheshwar',
              description: 'Dedicated to the navel of Lord Shiva.'
            },
            {
              title: 'Kalpeshwar',
              description: 'Dedicated to the hair locks of Lord Shiva.'
            }
          ]
        }
      ];
    }

    return newState;
  });

  // Save the initialized states back to localStorage
  localStorage.setItem('tourMyHolidayStates', JSON.stringify(initializedStates));
};

export default initializeStates; 