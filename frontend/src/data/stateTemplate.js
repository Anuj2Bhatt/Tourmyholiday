const stateTemplate = {
  id: '',
  name: '',
  emoji: '',
  description: '',
  image: '',
  capital: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [],
  sections: {
    history: {
      title: 'History',
      cards: []
    },
    districts: {
      title: 'Districts',
      cards: []
    },
    temples: {
      title: 'Temples',
      cards: []
    },
    rituals: {
      title: 'Rituals',
      cards: []
    },
    touristDestinations: {
      title: 'Tourist Destinations',
      cards: []
    },
    customSections: [] // For state-specific sections like Panch Kedar, Panch Prayag, etc.
  },
  packages: [] // Will store package IDs linked to this state
};

export default stateTemplate; 