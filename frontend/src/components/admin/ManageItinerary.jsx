import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManageItinerary.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { renderTitleWithEmojis, renderTextWithEmojis } from '../../utils/emojiSupport';
import watermarkImage from '../../assets/images/itinerary/watermark.png';

// Import PNG images
import airplaneIcon from '../../assets/images/itinerary/airplane.png';
import hotelIcon from '../../assets/images/itinerary/hotel.png';
import carIcon from '../../assets/images/itinerary/car.png';
import cameraIcon from '../../assets/images/itinerary/camera.png';
import mapIcon from '../../assets/images/itinerary/map.png';
import suitcaseIcon from '../../assets/images/itinerary/suitcase.png';
import passportIcon from '../../assets/images/itinerary/passport.png';
import compassIcon from '../../assets/images/itinerary/compass.png';
import backgroundPattern from '../../assets/images/itinerary/background-pattern.png';

// Add icons to library
library.add(fas);

// Define API URL constant
const API_URL = 'http://localhost:5000';

// Define a single constant for image height
const IMAGE_HEIGHT = 67; // Change this value to control image height everywhere

const ManageItinerary = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [currentItinerary, setCurrentItinerary] = useState({
    packageCost: '',
    travelDates: {
      startDate: '',
      endDate: ''
    },
    duration: '',
    destination: '',
    title: '',
    subtitle: '',
    bookingUrl: '',
    inclusions: '',
    exclusions: '',
    days: [],
    natureOfTrip: '',
    trekkingDays: '',
    maxAltitude: '',
    grade: '',
    season: '',
    accommodation: '',
    groupSize: ''
  });
  const [itinerarySchedule, setItinerarySchedule] = useState('');
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [predefinedPages, setPredefinedPages] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfGenerationProgress, setPdfGenerationProgress] = useState(0);
  const [itineraries, setItineraries] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [bottomImage, setBottomImage] = useState('');
  const [bottomImagePreview, setBottomImagePreview] = useState('');

  // Form handlers
  const handleItineraryChange = (e) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentItinerary(prev => {
        const newState = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
        return newState;
      });
    } else if (name === 'itinerarySchedule') {
      // Update itinerary schedule and parse days
      setItinerarySchedule(value);
      const parsedDays = parseItineraryDays(value);
      setCurrentItinerary(prev => ({
        ...prev,
        days: parsedDays
      }));
    } else {
      setCurrentItinerary(prev => {
        const newState = {
          ...prev,
          [name]: value
        };
        return newState;
      });
    }
  };

  const handleSaveItinerary = async () => {
    try {
      // TODO: Add API call to save itinerary
      const savedItinerary = { ...currentItinerary, id: Date.now() };
      setItineraries(prev => [...prev, savedItinerary]);
      setCurrentItinerary({
        packageCost: '',
        travelDates: {
          startDate: '',
          endDate: ''
        },
        duration: '',
        destination: '',
        title: '',
        subtitle: '',
        bookingUrl: '',
        inclusions: '',
        exclusions: '',
        days: [],
        natureOfTrip: '',
        trekkingDays: '',
        maxAltitude: '',
        grade: '',
        season: '',
        accommodation: '',
        groupSize: ''
      });
      alert('Itinerary saved successfully!');
    } catch (error) {
      alert('Error saving itinerary');
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setPdfGenerationProgress(0);

      // Debug log for current state
      // Create an array to store validation errors
      const missingFields = [];

      // Validate dates specifically
      const validationStartDate = currentItinerary.travelDates?.startDate;
      const validationEndDate = currentItinerary.travelDates?.endDate;

      if (!validationStartDate || validationStartDate.trim() === '') {
        missingFields.push('Start Date');
      }
      if (!validationEndDate || validationEndDate.trim() === '') {
        missingFields.push('End Date');
        } else if (new Date(validationEndDate) < new Date(validationStartDate)) {
        missingFields.push('End Date (must be after Start Date)');
        }

      // Validate days
      if (!currentItinerary.days || currentItinerary.days.length === 0) {
        missingFields.push('Day-wise Schedule (no valid days found)');
        }

      // Rest of the validation checks...
      if (!currentItinerary.title?.trim()) {
        missingFields.push('Title');
      }
      if (!currentItinerary.packageCost?.trim()) {
        missingFields.push('Package Cost');
      }
      if (!currentItinerary.duration?.trim()) {
        missingFields.push('Duration');
      }
      if (!currentItinerary.destination?.trim()) {
        missingFields.push('Destination');
      }
      if (!currentItinerary.inclusions?.trim()) {
        missingFields.push('Inclusions');
      }
      if (!currentItinerary.exclusions?.trim()) {
        missingFields.push('Exclusions');
      }
      if (!itinerarySchedule?.trim()) {
        missingFields.push('Day-wise Schedule');
      }

      // If any fields are missing, show detailed error
      if (missingFields.length > 0) {
        // Debug log
        const errorMessage = `Please fill in the following required fields:\n\n${missingFields.join('\n')}`;
        alert(errorMessage);
        setIsGeneratingPDF(false);
        setPdfGenerationProgress(0);
        return;
      }

      // Log successful validation
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 15;
      const blockHeight = 120;
      const white = [255, 255, 255];
      const black = [0, 0, 0];
      const yellow = [255, 215, 0];

      // --- IMAGE MARGIN SETTINGS FOR FIRST PAGE ---
      const imageMargin = 13; // mm
      const marginVW = 0.7; // vw
      // 1vw on A4 width (210mm) = 2.1mm, so 0.7vw ≈ 1.47mm
      const marginTop = 2; // mm (rounded from 1.47mm)
      const marginBottom = 1.5; // mm
      const imageWidth = pageWidth - 2 * imageMargin;
      const imageHeight = 65; // mm (increased)

      // --- BOTTOM IMAGE SETTINGS ---
      const bottomImageMargin = 13; // mm (left/right/bottom margin)
      const bottomImageHeight = 45; // mm (set as you wish)
      const bottomImageWidth = pageWidth - 2 * bottomImageMargin; // mm
      const bottomImageBottomMargin = 1.5; // mm (distance from bottom edge)

      // Set first page background to dark blue (like day pages)
      pdf.setFillColor(18, 52, 98);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Update progress for cover page
      setPdfGenerationProgress(10);

      // 1. Top Image (user-uploaded) with margin and top spacing
      let coverImg;
      if (useDefaultImage) {
        // Use default cover image
        const defaultCoverImage = 'https://media1.thrillophilia.com/filestore/p6eq8pwvlev79l658m2i7dlfokwc_Chopta_Tungnath_trek_00322c2541.jpg';
        coverImg = await fetch(defaultCoverImage)
          .then(r => r.blob())
          .then(blob => new Promise(res => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(blob);
          }));
      } else if (backgroundImage) {
        // Use custom uploaded image (already in base64)
        coverImg = backgroundImage;
      } else {
        // Fallback to default image if no image is selected
        const defaultCoverImage = 'https://media1.thrillophilia.com/filestore/p6eq8pwvlev79l658m2i7dlfokwc_Chopta_Tungnath_trek_00322c2541.jpg';
        coverImg = await fetch(defaultCoverImage)
          .then(r => r.blob())
          .then(blob => new Promise(res => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(blob);
          }));
      }

      if (coverImg) {
        pdf.addImage(coverImg, 'JPEG', imageMargin, marginTop, imageWidth, imageHeight); // Top image with margin and top spacing
      }

      // 2. Heading (centered, bold, underlined, red & blue)
      const headingY = imageHeight + marginTop + 15; // Adjusted for new image height and top margin
      const heading = currentItinerary.title || '';
      let headingRed = heading;
      let headingBlue = '';
      if (heading.includes('-')) {
        const parts = heading.split('-');
        headingRed = parts[0] + '-';
        headingBlue = parts.slice(1).join('-');
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      // Red part
      pdf.setTextColor(255, 255, 255);
      pdf.text(headingRed.trim(), pageWidth / 2, headingY, { align: 'center' });
      const redWidth = pdf.getTextWidth(headingRed.trim());
      // Blue part (right after red)
      pdf.setTextColor(255, 255, 255);
      pdf.text(headingBlue.trim(), pageWidth / 2 + redWidth / 2, headingY, { align: 'left' });
      // Underline
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(pageWidth / 2 - (redWidth + pdf.getTextWidth(headingBlue.trim())) / 2, headingY + 2, pageWidth / 2 + (redWidth + pdf.getTextWidth(headingBlue.trim())) / 2, headingY + 2);

      // 3. Info Table (two columns, left: bold label, right: value)
      const infoStartY = headingY + 10;
      const rowHeight = 8;
      const leftX = marginX + 5;
      const rightX = pageWidth / 2 + 5;
      let y = infoStartY + 10;
      const infoRows = [
        ['NATURE OF TRIP', currentItinerary.natureOfTrip || ''],
        ['LOCATION', currentItinerary.destination || ''],
        ['DURATION', currentItinerary.duration || ''],
        ['TREKKING DAYS', currentItinerary.trekkingDays || ''],
        ['MAXIMUM ALTITUDE', currentItinerary.maxAltitude || ''],
        ['GRADE', currentItinerary.grade || ''],
        ['SEASON', currentItinerary.season || ''],
        ['ACCOMODATION', currentItinerary.accommodation || ''],
        ['GROUP SIZE', currentItinerary.groupSize || ''],
      ];
      infoRows.forEach(([label, value]) => {
        pdf.setFont('Adita', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(label, leftX, y);
        pdf.setFont('Adita', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(value, rightX, y);
        y += rowHeight;
      });

      // 4. Welcome Message
      pdf.setFont('Adita', 'italic');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('...We welcome you to join us on this memorable trip!', leftX, y + 5);

      // 5. Bottom Image (user-uploaded) with margin and bottom spacing
      // 5. Bottom Image (user-uploaded) with margin and bottom spacing
      if (bottomImage && typeof bottomImage === 'string' && bottomImage.length > 0) {
        try {
          // Validate coordinates to prevent invalid coordinates error
          const bottomImageY = pageHeight - bottomImageHeight - bottomImageBottomMargin;

          // Ensure coordinates are valid (positive and within page bounds)
          if (bottomImageY >= 0 && bottomImageY + bottomImageHeight <= pageHeight &&
            bottomImageMargin >= 0 && bottomImageMargin + bottomImageWidth <= pageWidth) {

            // Detect image format from base64 string
            let imageFormat = 'JPEG'; // default
            if (bottomImage.startsWith('data:image/')) {
              const formatMatch = bottomImage.match(/data:image\/(\w+);/);
              if (formatMatch) {
                const format = formatMatch[1].toUpperCase();
                if (format === 'PNG' || format === 'JPEG' || format === 'JPG') {
                  imageFormat = format === 'JPG' ? 'JPEG' : format;
                }
              }
            }

            pdf.addImage(
              bottomImage,
              imageFormat,
              bottomImageMargin,
              bottomImageY,
              bottomImageWidth,
              bottomImageHeight
            );
          } else {
            }
        } catch (error) {
          // Continue without the bottom image rather than failing the entire PDF
        }
      } else {
        }

      // Helper function to calculate text height
      const calculateTextHeight = (text, maxWidth, fontSize) => {
        const lines = pdf.splitTextToSize(text, maxWidth - 16); // 16 for bullet point and margins
        return lines.length * (fontSize * 0.35); // Approximate line height
      };

      // Helper function to add description with smart breaks
      const addDescriptionWithSmartBreak = (description, startY, maxHeight, marginX, pageWidth) => {
        let currentY = startY;
        const lineHeight = 7;
        const maxWidth = pageWidth - 2 * marginX - 8; // 8 for bullet point and margins
        let remainingDescription = [];
        let descriptionFits = true;

        for (const bullet of description) {
          const bulletHeight = calculateTextHeight(bullet, maxWidth, 11);

          // Check if this bullet would exceed the max height
          if (currentY + bulletHeight > startY + maxHeight) {
            descriptionFits = false;
            remainingDescription = description.slice(description.indexOf(bullet));
            break;
          }

          pdf.text('-', marginX + 2, currentY);
          pdf.text(bullet, marginX + 8, currentY);
          currentY += lineHeight;
        }

        return {
          endY: currentY,
          descriptionFits,
          remainingDescription
        };
      };

      // Parse days from TinyMCE content (keeping exact same formatting)
      const parser = new DOMParser();
      const doc = parser.parseFromString(itinerarySchedule, 'text/html');
      let currentDay = null;
      let days = [];

      // Debug log
      // Helper function to clean text
      const cleanText = (text) => {
        return text.replace(/\s+/g, ' ').trim();
      };

      // Helper function to extract day number
      const extractDayNumber = (text) => {
        // Updated regex to match Day 0 and other formats
        const match = text.match(/^Day\s*(\d+)[:.]/i) ||
          text.match(/^Day\s*(\d+)\s/i) ||
          text.match(/^Day\s*0[:.]/i) ||
          text.match(/^Day\s*0\s/i);
        return match ? (match[1] || '0') : null;
      };

      // Process all nodes
      const processNode = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName.match(/^H[1-6]$/i)) {
          // Only headings start a new day
          const text = cleanText(node.textContent);
          const dayNumber = extractDayNumber(text);
          if (dayNumber) {
            if (currentDay) {
              days.push(currentDay);
            }
            currentDay = {
              dayNumber: dayNumber,
              title: text.replace(/^Day\s*\d+[:.]?\s*/i, '').trim(),
              description: [],
              imagePreview: null
            };
          }
          // After heading, add all following siblings (until next heading) as description
          let sibling = node.nextSibling;
          while (sibling && !(sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName.match(/^H[1-6]$/i))) {
            if (sibling.nodeType === Node.ELEMENT_NODE && (sibling.tagName === 'P' || sibling.tagName === 'DIV')) {
              const text = cleanText(sibling.textContent);
              if (text && !/^Day\s*\d+[:.]?/i.test(text) && currentDay) {
                currentDay.description.push(text);
              }
            }
            // Handle bullet points in UL > LI
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'UL' && currentDay) {
              Array.from(sibling.children).forEach(li => {
                if (li.tagName === 'LI') {
                  const text = cleanText(li.textContent);
                  if (text) {
                    currentDay.description.push(text);
                  }
                }
              });
            }
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'IMG' && currentDay) {
              currentDay.imagePreview = sibling.src;
            }
            sibling = sibling.nextSibling;
          }
        }
        // Recurse for children
        if (node.childNodes) {
          Array.from(node.childNodes).forEach(processNode);
        }
      };

      // Process all nodes in the document
      Array.from(doc.body.childNodes).forEach(processNode);

      // Add the last day if exists
      if (currentDay) {
        days.push(currentDay);
      }

      // Debug logs
      // Validate days array
      if (days.length === 0) {
        alert('No valid days found in the itinerary. Please make sure to format your content with "Day 1:", "Day 2:", etc.');
        setIsGeneratingPDF(false);
        setPdfGenerationProgress(0);
        return;
      }

      // Sort days by day number
      days.sort((a, b) => parseInt(a.dayNumber) - parseInt(b.dayNumber));

      // Calculate total steps for progress (keeping exact same formatting)
      const totalDays = days.length;
      const progressPerDay = 60 / totalDays;

      // Helper function to estimate height needed for a day's header, image, and at least one line of description
      const estimateDayBlockHeight = (day) => {
        const titleHeight = 16;
        const imageHeight = day.imagePreview ? IMAGE_HEIGHT : 0;
        const descLineHeight = 9;
        const padding = 20;
        return titleHeight + imageHeight + descLineHeight + padding;
      };

      // Helper to estimate height for title+image (keeping exact same formatting)
      const getTitleImageHeight = (day) => {
        const titleHeight = 16;
        // Only add image height if image exists
        const imageHeight = day.imagePreview ? IMAGE_HEIGHT : 0;
        const padding = 8;
        return titleHeight + imageHeight + padding;
      };

      // Helper to estimate height for a description bullet (keeping exact same formatting)
      const getBulletHeight = (text, maxWidth, fontSize) => {
        const lines = pdf.splitTextToSize(text, maxWidth - 16);
        return lines.length * (fontSize * 0.35) + 7;
      };

      // Helper to render title+image (keeping exact same formatting)
      const renderTitleAndImage = async (day, y) => {
        // Title Bar - Show only one header
        pdf.setDrawColor(...black);
        pdf.setLineWidth(1.5);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(marginX, y, pageWidth - 2 * marginX, 14, 'FD');
        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');

        // Add icon based on day content
        let iconToUse = null;
        const dayTitle = day.title.toLowerCase();
        const dayDescription = day.description.join(' ').toLowerCase();

        if (dayTitle.includes('airport') || dayTitle.includes('flight') || dayDescription.includes('airport') || dayDescription.includes('flight')) {
          iconToUse = airplaneIcon;
        } else if (dayTitle.includes('hotel') || dayTitle.includes('check-in') || dayDescription.includes('hotel') || dayDescription.includes('accommodation')) {
          iconToUse = hotelIcon;
        } else if (dayTitle.includes('car') || dayTitle.includes('transport') || dayDescription.includes('car') || dayDescription.includes('transport')) {
          iconToUse = carIcon;
        } else if (dayTitle.includes('camera') || dayTitle.includes('photo') || dayDescription.includes('camera') || dayDescription.includes('photo')) {
          iconToUse = cameraIcon;
        } else if (dayTitle.includes('map') || dayTitle.includes('explore') || dayDescription.includes('map') || dayDescription.includes('explore')) {
          iconToUse = mapIcon;
        } else if (dayTitle.includes('suitcase') || dayTitle.includes('pack') || dayDescription.includes('suitcase') || dayDescription.includes('pack')) {
          iconToUse = suitcaseIcon;
        } else if (dayTitle.includes('passport') || dayTitle.includes('visa') || dayDescription.includes('passport') || dayDescription.includes('visa')) {
          iconToUse = passportIcon;
        } else if (dayTitle.includes('compass') || dayTitle.includes('direction') || dayDescription.includes('compass') || dayDescription.includes('direction')) {
          iconToUse = compassIcon;
        }

        // Add icon if available
        if (iconToUse) {
          pdf.addImage(iconToUse, 'PNG', marginX + 3, y + 1, 12, 12);
          // Show title with icon: Day X: Title
          pdf.text(`Day ${day.dayNumber}: ${day.title}`, marginX + 18, y + 9);
        } else {
          // Show title only: Day X: Title
          pdf.text(`Day ${day.dayNumber}: ${day.title}`, marginX + 3, y + 9);
        }

        let imageBottom = y + 16;
        if (day.imagePreview) {
          try {
            // Use image directly if it's already base64
            const img = day.imagePreview.startsWith('data:')
              ? day.imagePreview
              : await fetch(day.imagePreview)
                .then(r => r.blob())
                .then(blob => new Promise(res => {
                  const reader = new FileReader();
                  reader.onload = () => res(reader.result);
                  reader.readAsDataURL(blob);
                }));

            const imageY = y + 16 + 4;
            pdf.setDrawColor(...black);
            pdf.setLineWidth(1);
            pdf.rect(marginX, imageY - 1, pageWidth - 2 * marginX, IMAGE_HEIGHT + 2, 'S');
            pdf.addImage(img, 'JPEG', 'webp', marginX + 1, imageY, pageWidth - 2 * marginX - 2, IMAGE_HEIGHT);
            imageBottom = imageY + IMAGE_HEIGHT;
          } catch (error) {
            imageBottom = y + 16;
          }
        }
        return imageBottom + 8;
      };

      // Helper to render description bullets (keeping exact same formatting)
      const renderDescriptionSmart = (description, startY, maxHeight, marginX, pageWidth) => {
        let currentY = startY;
        const lineHeight = 7;
        const maxWidth = pageWidth - 2 * marginX - 8;
        let remainingDescription = [];
        let descriptionFits = true;
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        for (let i = 0; i < description.length; i++) {
          const bullet = description[i];
          const bulletHeight = getBulletHeight(bullet, maxWidth, 11);
          if (currentY + bulletHeight > startY + maxHeight) {
            descriptionFits = false;
            remainingDescription = description.slice(i);
            break;
          }
          pdf.text('-', marginX + 2, currentY);
          pdf.text(bullet, marginX + 8, currentY);
          currentY += lineHeight;
        }
        return {
          endY: currentY,
          descriptionFits,
          remainingDescription
        };
      };

      // --- Main day-wise rendering logic (keeping exact same formatting) ---
      let pageY = 15;
      let isFirstDay = true;
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day) break;
        setPdfGenerationProgress(20 + (i + 1) * progressPerDay);

        // Always check if there is enough space for title+image
        const headerHeight = getTitleImageHeight(day);
        const availableSpace = pageHeight - pageY - 40;
        if (!isFirstDay && availableSpace < headerHeight) {
          pdf.addPage();
          pageY = 15;
          pdf.setFillColor(18, 52, 98);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        } else if (isFirstDay) {
          pdf.addPage();
          pageY = 15;
          pdf.setFillColor(18, 52, 98);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          isFirstDay = false;
        }

        // Render title+image
        pageY = await renderTitleAndImage(day, pageY);

        // Render description (may need to split across pages)
        let descBullets = day.description;
        while (descBullets && descBullets.length > 0) {
          const descAvailable = pageHeight - pageY - 40;
          const { endY, descriptionFits, remainingDescription } = renderDescriptionSmart(
            descBullets,
            pageY,
            descAvailable,
            marginX,
            pageWidth
          );
          pageY = endY + 2;
          if (!descriptionFits && remainingDescription.length > 0) {
            // Add footer before breaking page (keeping exact same formatting)
            pdf.setFillColor(18, 52, 98);
            pdf.rect(0, pageHeight - 18, pageWidth, 18, 'F');
            pdf.setDrawColor(...black);
            pdf.setLineWidth(2);
            pdf.line(0, pageHeight - 18, pageWidth, pageHeight - 18);
            pdf.setFontSize(11);
            pdf.setTextColor(255, 255, 255);
            pdf.textWithLink(' www.tourmyholiday.com', marginX, pageHeight - 7, { url: 'https://www.tourmyholiday.com' });
            pdf.text(' +91-9990055699', pageWidth / 2 + 10, pageHeight - 7);
            // New page for remaining description
            pdf.addPage();
            pageY = 15;
            pdf.setFillColor(18, 52, 98);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            // Optional: add continuation header
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(13);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`Day ${day.dayNumber} (continued)`, marginX, pageY);
            pageY += 12;
            descBullets = remainingDescription;
          } else {
            descBullets = [];
          }
        }

        // Add footer to current page (keeping exact same formatting)
        pdf.setFillColor(18, 52, 98);
        pdf.rect(0, pageHeight - 18, pageWidth, 18, 'F');
        pdf.setDrawColor(...black);
        pdf.setLineWidth(2);
        pdf.line(0, pageHeight - 18, pageWidth, pageHeight - 18);
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.textWithLink(' www.tourmyholiday.com', marginX, pageHeight - 7, { url: 'https://www.tourmyholiday.com' });
        pdf.text(' +91-9990055699', pageWidth / 2 + 10, pageHeight - 7);
      }

      // --- Simple Inclusions Page ---
      const watermarkBase64 = await getBase64FromImage(watermarkImage);
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setDrawColor(255, 204, 0); // yellow
      pdf.setLineWidth(2);
      pdf.rect(1, 1, pageWidth-2, pageHeight-2, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text('INCLUSIONS', pageWidth/2, 30, { align: 'center' });
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(2);
      pdf.line(pageWidth/2 - 30, 35, pageWidth/2 + 30, 35);
      pdf.addImage(watermarkBase64, 'PNG', pageWidth-40, 10, 30, 30, '', 'FAST');
      // Bullet points
      const inclusionsContent = currentItinerary.inclusions;
      if (inclusionsContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = inclusionsContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const lines = textContent.split('\n').filter(line => line.trim());
        let y = 55;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        for (const line of lines) {
          if (y > pageHeight - 30) {
            pdf.addPage();
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setDrawColor(255, 204, 0);
            pdf.setLineWidth(2);
            pdf.rect(1, 1, pageWidth-2, pageHeight-2, 'S');
            pdf.addImage(watermarkBase64, 'PNG', pageWidth-40, 10, 30, 30, '', 'FAST');
            y = 50;
          }
          pdf.setFont('helvetica', line.match(/^[A-Z]/) ? 'bold' : 'normal');
          pdf.text(`• ${line.trim()}`, 25, y);
          y += 12;
        }
      }

      // --- Simple Exclusions Page ---
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setDrawColor(255, 204, 0); // yellow
      pdf.setLineWidth(2);
      pdf.rect(1, 1, pageWidth-2, pageHeight-2, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text('EXCLUSIONS', pageWidth/2, 30, { align: 'center' });
      pdf.setDrawColor(255, 204, 0);
      pdf.setLineWidth(2);
      pdf.line(pageWidth/2 - 30, 35, pageWidth/2 + 30, 35);
      pdf.addImage(watermarkBase64, 'PNG', pageWidth-40, 10, 30, 30, '', 'FAST');
      // Bullet points
      const exclusionsContent = currentItinerary.exclusions;
      if (exclusionsContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = exclusionsContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const lines = textContent.split('\n').filter(line => line.trim());
        let y = 55;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        for (const line of lines) {
          if (y > pageHeight - 30) {
            pdf.addPage();
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setDrawColor(255, 204, 0);
            pdf.setLineWidth(2);
            pdf.rect(1, 1, pageWidth-2, pageHeight-2, 'S');
            pdf.addImage(watermarkBase64, 'PNG', pageWidth-40, 10, 30, 30, '', 'FAST');
            y = 50;
          }
          pdf.setFont('helvetica', line.match(/^[A-Z]/) ? 'bold' : 'normal');
          pdf.text(`• ${line.trim()}`, 25, y);
          y += 12;
        }
      }

      // Add predefined pages if any
      for (const page of predefinedPages) {
        pdf.addPage();
        // Defensive: use page.preview if available, else page.image, else skip
        let imgData = null;
        if (page && page.preview) {
          imgData = page.preview;
        } else if (page && page.image) {
          imgData = page.image;
        }
        if (imgData) {
          try {
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
          } catch (err) {
            }
        } else {
          }
      }

      // Save the PDF
      const fileName = `${currentItinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;

      // Create PDF preview instead of downloading
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
      setShowPdfPreview(true);

      setPdfGenerationProgress(100);
      setIsGeneratingPDF(false);
      alert('PDF generated successfully! Preview is now available.');

    } catch (error) {
      alert('Error generating PDF. Please try again.');
      setIsGeneratingPDF(false);
      setPdfGenerationProgress(0);
    }
  };

  // Helper function to parse itinerary days from TinyMCE content
  const parseItineraryDays = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    let currentDay = null;
    let days = [];

    const cleanText = (text) => {
      return text.replace(/\s+/g, ' ').trim();
    };

    const extractDayNumber = (text) => {
      const match = text.match(/^Day\s*(\d+)[:.]/i) ||
        text.match(/^Day\s*(\d+)\s/i) ||
        text.match(/^Day\s*0[:.]/i) ||
        text.match(/^Day\s*0\s/i);
      return match ? (match[1] || '0') : null;
    };

    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName.match(/^H[1-6]$/i)) {
        const text = cleanText(node.textContent);
        const dayNumber = extractDayNumber(text);
        if (dayNumber) {
          if (currentDay) {
            days.push(currentDay);
          }
          currentDay = {
            dayNumber: dayNumber,
            title: text.replace(/^Day\s*\d+[:.]?\s*/i, '').trim(),
            description: [],
            imagePreview: null
          };
        }
        let sibling = node.nextSibling;
        while (sibling && !(sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName.match(/^H[1-6]$/i))) {
          if (sibling.nodeType === Node.ELEMENT_NODE && (sibling.tagName === 'P' || sibling.tagName === 'DIV')) {
            const text = cleanText(sibling.textContent);
            if (text && !/^Day\s*\d+[:.]?/i.test(text) && currentDay) {
              currentDay.description.push(text);
            }
          }
          if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'UL' && currentDay) {
            Array.from(sibling.children).forEach(li => {
              if (li.tagName === 'LI') {
                const text = cleanText(li.textContent);
                if (text) {
                  currentDay.description.push(text);
                }
              }
            });
          }
          if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'IMG' && currentDay) {
            currentDay.imagePreview = sibling.src;
          }
          sibling = sibling.nextSibling;
        }
      }
      if (node.childNodes) {
        Array.from(node.childNodes).forEach(processNode);
      }
    };

    Array.from(doc.body.childNodes).forEach(processNode);

    if (currentDay) {
      days.push(currentDay);
    }

    return days.sort((a, b) => parseInt(a.dayNumber) - parseInt(b.dayNumber));
  };

  // PNG Background Removal Function
  const removeBackgroundFromImage = (imageFile) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal (remove white/light backgrounds)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is white or very light
          if (r > 240 && g > 240 && b > 240) {
            // Make it transparent
            data[i + 3] = 0; // Alpha channel
          }
          // Also remove very light gray backgrounds
          else if (r > 220 && g > 220 && b > 220) {
            data[i + 3] = 0;
          }
        }

        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert to base64
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  };

  // Enhanced image upload with background removal
  const handleBackgroundImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Remove background if it's a PNG
        let processedImage;
        if (file.type === 'image/png') {
          processedImage = await removeBackgroundFromImage(file);
        } else {
          // For other formats, just convert to base64
          const reader = new FileReader();
          processedImage = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }

        setBackgroundImage(processedImage);
        setImagePreview(processedImage);
      } catch (error) {
        alert('Error processing image. Please try again.');
      }
    }
  };

  // Enhanced predefined page upload with background removal
  const handlePredefinedPageUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        let processedImage;
        if (file.type === 'image/png') {
          processedImage = await removeBackgroundFromImage(file);
        } else {
          const reader = new FileReader();
          processedImage = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }

        setPredefinedPages(prev => [...prev, {
          file: file,
          preview: processedImage
        }]);
      } catch (error) {
        alert(`Error processing ${file.name}. Please try again.`);
      }
    }
  };

  // Remove predefined page
  const removePredefinedPage = (index) => {
    setPredefinedPages(prev => prev.filter((_, i) => i !== index));
  };

  // Load saved itineraries on component mount
  useEffect(() => {
    // TODO: Load from API
    const savedItineraries = JSON.parse(localStorage.getItem('itineraries') || '[]');
    setItineraries(savedItineraries);
  }, []);

  // Save itineraries to localStorage when they change
  useEffect(() => {
    localStorage.setItem('itineraries', JSON.stringify(itineraries));
  }, [itineraries]);

  // Add a handler for bottom image upload
  const handleBottomImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBottomImagePreview(reader.result);
        setBottomImage(reader.result); // Set the base64 data for PDF
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to convert imported image to base64
  const getBase64FromImage = (imgPath) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imgPath;
    });
  };

  return (
    <div className="mi-manage-itinerary-container">
      <div className="mi-itinerary-tab-container">
        <button
          className={`mi-itinerary-tab-button ${activeTab === 'create' ? 'mi-itinerary-tab-active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Itinerary
        </button>
        <button
          className={`mi-itinerary-tab-button ${activeTab === 'manage' ? 'mi-itinerary-tab-active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Itineraries
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="mi-itinerary-form-container">
          <div className="mi-itinerary-form-header">
            <h2 className="mi-itinerary-form-title">Create New Itinerary</h2>
            <p className="mi-itinerary-form-subtitle">Fill in the details below to create your travel itinerary</p>
          </div>

          {/* Basic Information Section */}
          <div className="mi-itinerary-form-section">
            <h3 className="mi-itinerary-section-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="mi-section-icon" />
              Basic Information
            </h3>
            <div className="mi-itinerary-form-grid">
              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Title:</label>
                <input
                  type="text"
                  name="title"
                  value={currentItinerary.title}
                  onChange={handleItineraryChange}
                  placeholder="Enter package title"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Subtitle (Optional):</label>
                <input
                  type="text"
                  name="subtitle"
                  value={currentItinerary.subtitle}
                  onChange={handleItineraryChange}
                  placeholder="Enter subtitle"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Destination:</label>
                <input
                  type="text"
                  name="destination"
                  value={currentItinerary.destination}
                  onChange={handleItineraryChange}
                  placeholder="Enter destination"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Duration:</label>
                <input
                  type="text"
                  name="duration"
                  value={currentItinerary.duration}
                  onChange={handleItineraryChange}
                  placeholder="e.g., 5 Days / 4 Nights"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">
                  <FontAwesomeIcon icon={faIndianRupeeSign} className="mi-label-icon" />
                  Package Cost:
                </label>
                <input
                  type="text"
                  name="packageCost"
                  value={currentItinerary.packageCost}
                  onChange={handleItineraryChange}
                  placeholder="e.g., ₹25,000 per person"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Booking URL (Optional):</label>
                <input
                  type="url"
                  name="bookingUrl"
                  value={currentItinerary.bookingUrl}
                  onChange={handleItineraryChange}
                  placeholder="https://example.com/booking"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Start Date:</label>
                <input
                  type="date"
                  name="travelDates.startDate"
                  value={currentItinerary.travelDates.startDate}
                  onChange={handleItineraryChange}
                  className="mi-itinerary-input mi-itinerary-date-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">End Date:</label>
                <input
                  type="date"
                  name="travelDates.endDate"
                  value={currentItinerary.travelDates.endDate}
                  onChange={handleItineraryChange}
                  className="mi-itinerary-input mi-itinerary-date-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Nature of Trip:</label>
                <input
                  type="text"
                  name="natureOfTrip"
                  value={currentItinerary.natureOfTrip}
                  onChange={handleItineraryChange}
                  placeholder="e.g., Trekking"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Trekking Days:</label>
                <input
                  type="text"
                  name="trekkingDays"
                  value={currentItinerary.trekkingDays}
                  onChange={handleItineraryChange}
                  placeholder="e.g., 3 Days"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Maximum Altitude:</label>
                <input
                  type="text"
                  name="maxAltitude"
                  value={currentItinerary.maxAltitude}
                  onChange={handleItineraryChange}
                  placeholder="e.g., 4000m"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Grade:</label>
                <input
                  type="text"
                  name="grade"
                  value={currentItinerary.grade}
                  onChange={handleItineraryChange}
                  placeholder="e.g., Moderate"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Season:</label>
                <input
                  type="text"
                  name="season"
                  value={currentItinerary.season}
                  onChange={handleItineraryChange}
                  placeholder="e.g., Sep-Nov"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Accommodation:</label>
                <input
                  type="text"
                  name="accommodation"
                  value={currentItinerary.accommodation}
                  onChange={handleItineraryChange}
                  placeholder="e.g., Alpine Camping, Hotel"
                  className="mi-itinerary-input"
                />
              </div>

              <div className="mi-itinerary-form-group">
                <label className="mi-itinerary-label">Group Size:</label>
                <input
                  type="text"
                  name="groupSize"
                  value={currentItinerary.groupSize}
                  onChange={handleItineraryChange}
                  placeholder="e.g., Maximum of 15 persons"
                  className="mi-itinerary-input"
                />
              </div>
            </div>
          </div>

          {/* Package Features Section */}
          <div className="mi-itinerary-form-section">
            <h3 className="mi-itinerary-section-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="mi-section-icon" />
              Package Features
            </h3>
            <div className="mi-itinerary-form-grid">
              <div className="mi-itinerary-form-group mi-itinerary-full-width">
                <label className="mi-itinerary-label">Inclusions:</label>
                <Editor
                  apiKey="m5tpfu2byudniwkqc4ba5djkgsypw5ewcjwltepff4t1ffh6"
                  value={currentItinerary.inclusions}
                  onEditorChange={(content) => {
                    setCurrentItinerary(prev => ({
                      ...prev,
                      inclusions: content
                    }));
                  }}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #333; }'
                  }}
                  className="mi-itinerary-editor"
                />
              </div>

              <div className="mi-itinerary-form-group mi-itinerary-full-width">
                <label className="mi-itinerary-label">Exclusions:</label>
                <Editor
                  apiKey="m5tpfu2byudniwkqc4ba5djkgsypw5ewcjwltepff4t1ffh6"
                  value={currentItinerary.exclusions}
                  onEditorChange={(content) => {
                    setCurrentItinerary(prev => ({
                      ...prev,
                      exclusions: content
                    }));
                  }}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #333; }'
                  }}
                  className="mi-itinerary-editor"
                />
              </div>
            </div>
          </div>

          {/* Itinerary Schedule Section */}
          <div className="mi-itinerary-form-section">
            <h3 className="mi-itinerary-section-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="mi-section-icon" />
              Day-wise Itinerary Schedule
            </h3>
            <div className="mi-itinerary-form-group mi-itinerary-full-width">
              <label className="mi-itinerary-label">Schedule:</label>
              <Editor
                apiKey="m5tpfu2byudniwkqc4ba5djkgsypw5ewcjwltepff4t1ffh6"
                value={itinerarySchedule}
                onEditorChange={(content) => {
                  setItinerarySchedule(content);
                  const parsedDays = parseItineraryDays(content);
                  setCurrentItinerary(prev => ({
                    ...prev,
                    days: parsedDays
                  }));
                }}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #333; }'
                }}
                className="mi-itinerary-editor"
              />
              <div className="mi-itinerary-help-text">
                <p><strong>Format your itinerary like this:</strong></p>
                <p>Day 1: Arrival and Check-in</p>
                <p>• Arrive at the airport</p>
                <p>• Transfer to hotel</p>
                <p>• Check-in and rest</p>
                <br />
                <p>Day 2: City Tour</p>
                <p>• Breakfast at hotel</p>
                <p>• Visit local attractions</p>
                <p>• Dinner at restaurant</p>
              </div>
            </div>
          </div>

          {/* Background Image Section */}
          <div className="mi-itinerary-form-section">
            <h3 className="mi-itinerary-section-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="mi-section-icon" />
              Cover Page Background
            </h3>
            <div className="mi-itinerary-form-group">
              <div className="mi-itinerary-radio-group">
                <label className="mi-itinerary-radio-label">
                  <input
                    type="radio"
                    name="backgroundType"
                    checked={useDefaultImage}
                    onChange={() => setUseDefaultImage(true)}
                    className="mi-itinerary-radio"
                  />
                  <span className="mi-itinerary-radio-text">Use Default Background</span>
                </label>
                <label className="mi-itinerary-radio-label">
                  <input
                    type="radio"
                    name="backgroundType"
                    checked={!useDefaultImage}
                    onChange={() => setUseDefaultImage(false)}
                    className="mi-itinerary-radio"
                  />
                  <span className="mi-itinerary-radio-text">Upload Custom Background</span>
                </label>
              </div>
            </div>

            {!useDefaultImage && (
              <div className="mi-itinerary-form-group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageChange}
                  className="mi-itinerary-file-input"
                />
                {imagePreview && (
                  <div className="mi-itinerary-image-preview">
                    <img src={imagePreview} alt="Background preview" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Predefined Pages Section */}
          <div className="mi-itinerary-form-section">
            <h3 className="mi-itinerary-section-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="mi-section-icon" />
              Additional Pages (Optional)
            </h3>
            <div className="mi-itinerary-form-group">
              <label className="mi-itinerary-label">Upload additional pages to add at the end:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePredefinedPageUpload}
                className="mi-itinerary-file-input"
              />
            </div>

            {predefinedPages.length > 0 && (
              <div className="mi-itinerary-pages-preview">
                <h4 className="mi-itinerary-pages-title">Uploaded Pages:</h4>
                <div className="mi-itinerary-pages-grid">
                  {predefinedPages.map((page, index) => (
                    <div key={index} className="mi-itinerary-page-preview">
                      <img src={page.preview} alt={`Page ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removePredefinedPage(index)}
                        className="mi-itinerary-remove-page-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Image Section */}
          <div className="mi-itinerary-form-section">
            <h3 className="mi-itinerary-section-title">Bottom Image (for first page)</h3>
            <div className="mi-itinerary-form-group">
              <input
                type="file"
                accept="image/*"
                onChange={handleBottomImageChange}
                className="mi-itinerary-file-input"
              />
              {bottomImagePreview && (
                <div className="mi-itinerary-image-preview">
                  <img src={bottomImagePreview} alt="Bottom preview" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mi-itinerary-form-actions">
            <button
              type="button"
              onClick={handleSaveItinerary}
              className="mi-itinerary-save-btn"
            >
              Save Itinerary
            </button>

            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="mi-itinerary-generate-pdf-btn"
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
            </button>
          </div>

          {/* Progress Bar */}
          {isGeneratingPDF && (
            <div className="mi-itinerary-progress-container">
              <div className="mi-itinerary-progress-bar">
                <div
                  className="mi-itinerary-progress-fill"
                  style={{ width: `${pdfGenerationProgress}%` }}
                ></div>
              </div>
              <div className="mi-itinerary-progress-text">{pdfGenerationProgress}%</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="mi-itinerary-manage-container">
          <h2 className="mi-itinerary-manage-title">Manage Itineraries</h2>
          {itineraries.length === 0 ? (
            <p className="mi-itinerary-no-data">No itineraries found. Create your first itinerary!</p>
          ) : (
            <div className="mi-itinerary-cards-grid">
              {itineraries.map((itinerary, index) => (
                <div key={index} className="mi-itinerary-card">
                  <h3 className="mi-itinerary-card-title">{itinerary.title}</h3>
                  <p className="mi-itinerary-card-info"><strong>Destination:</strong> {itinerary.destination}</p>
                  <p className="mi-itinerary-card-info"><strong>Duration:</strong> {itinerary.duration}</p>
                  <p className="mi-itinerary-card-info"><strong>Cost:</strong> {itinerary.packageCost}</p>
                  <div className="mi-itinerary-card-actions">
                    <button
                      onClick={() => setCurrentItinerary(itinerary)}
                      className="mi-itinerary-card-edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setItineraries(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="mi-itinerary-card-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPdfPreview && pdfPreviewUrl && (
        <div className="mi-itinerary-pdf-modal-overlay">
          <div className="mi-itinerary-pdf-modal">
            <div className="mi-itinerary-pdf-modal-header">
              <h3 className="mi-itinerary-pdf-modal-title">PDF Preview</h3>
              <div className="mi-itinerary-pdf-modal-actions">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfPreviewUrl;
                    link.download = `${currentItinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
                    link.click();
                  }}
                  className="mi-itinerary-pdf-download-btn"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowPdfPreview(false);
                    setPdfPreviewUrl(null);
                  }}
                  className="mi-itinerary-pdf-close-btn"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="mi-itinerary-pdf-modal-content">
              <iframe
                src={pdfPreviewUrl}
                title="PDF Preview"
                className="mi-itinerary-pdf-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItinerary; 