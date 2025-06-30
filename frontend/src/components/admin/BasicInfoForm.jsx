import React, { useState } from 'react';
import { toast } from 'react-toastify';
import wildlifeBasicInfoService from '../../services/wildlifeBasicInfoService';
import './BasicInfoForm.css';

const BasicInfoForm = ({ onCancel, onSuccess, editingData = null, sanctuaryId = null, sanctuaryName = '' }) => {
  const [formData, setFormData] = useState({
    sanctuary_id: sanctuaryId || '',
    sanctuaryName: editingData?.sanctuary_name || sanctuaryName || '',
    location: editingData?.location || '',
    totalArea: editingData?.total_area || '',
    establishedYear: editingData?.established_year || '',
    
    // Entry Fees
    entryFeeAdults: editingData?.entry_fee_adults || '',
    entryFeeChildren: editingData?.entry_fee_children || '',
    entryFeeForeign: editingData?.entry_fee_foreign || '',
    cameraFee: editingData?.camera_fee || '',
    videoCameraFee: editingData?.video_camera_fee || '',
    
    // Timings
    openingTime: editingData?.opening_time || '',
    closingTime: editingData?.closing_time || '',
    bestTimeToVisit: editingData?.best_time_to_visit || '',
    peakSeason: editingData?.peak_season || '',
    offSeason: editingData?.off_season || '',
    
    // Visitor Capacity
    dailyVisitorCapacity: editingData?.daily_visitor_capacity || '',
    maxGroupSize: editingData?.max_group_size || '',
    
    // Contact Information
    contactNumber: editingData?.contact_number || '',
    emailAddress: editingData?.email_address || '',
    website: editingData?.website || '',
    emergencyContact: editingData?.emergency_contact || '',
    
    // Transportation
    nearestAirport: editingData?.nearest_airport || '',
    nearestRailway: editingData?.nearest_railway || '',
    nearestBusStand: editingData?.nearest_bus_stand || '',
    distanceFromAirport: editingData?.distance_from_airport || '',
    distanceFromRailway: editingData?.distance_from_railway || '',
    distanceFromBusStand: editingData?.distance_from_bus_stand || '',
    
    // Facilities
    parkingAvailable: editingData?.parking_available || '',
    parkingFee: editingData?.parking_fee || '',
    restroomFacilities: editingData?.restroom_facilities || '',
    drinkingWater: editingData?.drinking_water || '',
    firstAidFacility: editingData?.first_aid_facility || '',
    souvenirShop: editingData?.souvenir_shop || '',
    foodCourt: editingData?.food_court || '',
    
    // Accessibility
    wheelchairAccessible: editingData?.wheelchair_accessible || false,
    seniorCitizenFriendly: editingData?.senior_citizen_friendly || false,
    childFriendly: editingData?.child_friendly || false,
    
    // Photography & Rules
    photographyAllowed: editingData?.photography_allowed !== undefined ? editingData.photography_allowed : true,
    dronePhotographyAllowed: editingData?.drone_photography_allowed || false,
    flashPhotographyAllowed: editingData?.flash_photography_allowed || false,
    tripodAllowed: editingData?.tripod_allowed || false,
    
    // Permits & Booking
    advanceBookingRequired: editingData?.advance_booking_required || false,
    onlineBookingAvailable: editingData?.online_booking_available || false,
    permitRequired: editingData?.permit_required || false,
    permitFee: editingData?.permit_fee || '',
    permitValidity: editingData?.permit_validity || '',
    
    // Safety & Guidelines
    dressCode: editingData?.dress_code || '',
    whatToCarry: editingData?.what_to_carry || '',
    whatNotToCarry: editingData?.what_not_to_carry || '',
    safetyGuidelines: editingData?.safety_guidelines || '',
    rulesAndRegulations: editingData?.rules_and_regulations || '',
    
    // Weather & Climate
    weatherInfo: editingData?.weather_info || '',
    temperatureRange: editingData?.temperature_range || '',
    monsoonInfo: editingData?.monsoon_info || '',
    
    // Additional Info
    specialInstructions: editingData?.special_instructions || '',
    importantNotes: editingData?.important_notes || '',
    cancellationPolicy: editingData?.cancellation_policy || '',
    refundPolicy: editingData?.refund_policy || ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert form data to backend format (snake_case)
      const backendData = {
        sanctuary_id: formData.sanctuary_id,
        sanctuary_name: formData.sanctuaryName,
        location: formData.location,
        total_area: formData.totalArea,
        established_year: formData.establishedYear,
        entry_fee_adults: formData.entryFeeAdults,
        entry_fee_children: formData.entryFeeChildren,
        entry_fee_foreign: formData.entryFeeForeign,
        camera_fee: formData.cameraFee,
        video_camera_fee: formData.videoCameraFee,
        parking_fee: formData.parkingFee,
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        best_time_to_visit: formData.bestTimeToVisit,
        peak_season: formData.peakSeason,
        off_season: formData.offSeason,
        daily_visitor_capacity: formData.dailyVisitorCapacity,
        max_group_size: formData.maxGroupSize,
        contact_number: formData.contactNumber,
        email_address: formData.emailAddress,
        website: formData.website,
        emergency_contact: formData.emergencyContact,
        nearest_airport: formData.nearestAirport,
        nearest_railway: formData.nearestRailway,
        nearest_bus_stand: formData.nearestBusStand,
        distance_from_airport: formData.distanceFromAirport,
        distance_from_railway: formData.distanceFromRailway,
        distance_from_bus_stand: formData.distanceFromBusStand,
        parking_available: formData.parkingAvailable,
        restroom_facilities: formData.restroomFacilities,
        drinking_water: formData.drinkingWater,
        first_aid_facility: formData.firstAidFacility,
        souvenir_shop: formData.souvenirShop,
        food_court: formData.foodCourt,
        wheelchair_accessible: formData.wheelchairAccessible,
        senior_citizen_friendly: formData.seniorCitizenFriendly,
        child_friendly: formData.childFriendly,
        photography_allowed: formData.photographyAllowed,
        drone_photography_allowed: formData.dronePhotographyAllowed,
        flash_photography_allowed: formData.flashPhotographyAllowed,
        tripod_allowed: formData.tripodAllowed,
        advance_booking_required: formData.advanceBookingRequired,
        online_booking_available: formData.onlineBookingAvailable,
        permit_required: formData.permitRequired,
        permit_fee: formData.permitFee,
        permit_validity: formData.permitValidity,
        dress_code: formData.dressCode,
        what_to_carry: formData.whatToCarry,
        what_not_to_carry: formData.whatNotToCarry,
        safety_guidelines: formData.safetyGuidelines,
        rules_and_regulations: formData.rulesAndRegulations,
        weather_info: formData.weatherInfo,
        temperature_range: formData.temperatureRange,
        monsoon_info: formData.monsoonInfo,
        special_instructions: formData.specialInstructions,
        important_notes: formData.importantNotes,
        cancellation_policy: formData.cancellationPolicy,
        refund_policy: formData.refundPolicy
      };

      if (editingData) {
        // Update existing record
        await wildlifeBasicInfoService.updateBasicInfo(editingData.id, backendData);
        toast.success('Basic information updated successfully!');
      } else {
        // Create new record
        await wildlifeBasicInfoService.createBasicInfo(backendData);
        toast.success('Basic information added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save basic information';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="basic-info-form-new">
      <div className="form-header">
        <h3>
          {editingData ? 'Edit Basic Information' : 'Add New Basic Information'}
          {sanctuaryName && (
            <span className="sanctuary-name"> - {sanctuaryName}</span>
          )}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="form-content">
        {/* Basic Details Section */}
        <div className="form-section">
          <h4>Basic Details</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Sanctuary Name *</label>
              <input
                type="text"
                name="sanctuaryName"
                value={formData.sanctuaryName}
                onChange={handleInputChange}
                placeholder="Enter sanctuary name"
                required
              />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Total Area</label>
              <input
                type="text"
                name="totalArea"
                value={formData.totalArea}
                onChange={handleInputChange}
                placeholder="e.g., 500 sq km"
                style={{color: 'black'}}
              />
            </div>
            <div className="form-group">
              <label>Established Year</label>
              <input
                type="number"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleInputChange}
                placeholder="e.g., 1985"
              />
            </div>
          </div>
        </div>

        {/* Entry Fees Section */}
        <div className="form-section">
          <h4>Entry Fees & Charges</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Entry Fee - Adults (₹)</label>
              <input
                type="number"
                name="entryFeeAdults"
                value={formData.entryFeeAdults}
                onChange={handleInputChange}
                placeholder="Enter fee for adults"
              />
            </div>
            <div className="form-group">
              <label>Entry Fee - Children (₹)</label>
              <input
                type="number"
                name="entryFeeChildren"
                value={formData.entryFeeChildren}
                onChange={handleInputChange}
                placeholder="Enter fee for children"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Entry Fee - Foreign Nationals (₹)</label>
              <input
                type="number"
                name="entryFeeForeign"
                value={formData.entryFeeForeign}
                onChange={handleInputChange}
                placeholder="Enter fee for foreign nationals"
              />
            </div>
            <div className="form-group">
              <label>Camera Fee (₹)</label>
              <input
                type="number"
                name="cameraFee"
                value={formData.cameraFee}
                onChange={handleInputChange}
                placeholder="Enter camera fee"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Video Camera Fee (₹)</label>
              <input
                type="number"
                name="videoCameraFee"
                value={formData.videoCameraFee}
                onChange={handleInputChange}
                placeholder="Enter video camera fee"
              />
            </div>
            <div className="form-group">
              <label>Parking Fee (₹)</label>
              <input
                type="number"
                name="parkingFee"
                value={formData.parkingFee}
                onChange={handleInputChange}
                placeholder="Enter parking fee"
              />
            </div>
          </div>
        </div>

        {/* Timings Section */}
        <div className="form-section">
          <h4>Park Timings & Seasons</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Best Time to Visit</label>
              <input
                type="text"
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleInputChange}
                placeholder="e.g., October to March"
              />
            </div>
            <div className="form-group">
              <label>Peak Season</label>
              <input
                type="text"
                name="peakSeason"
                value={formData.peakSeason}
                onChange={handleInputChange}
                placeholder="e.g., November to February"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Off Season</label>
              <input
                type="text"
                name="offSeason"
                value={formData.offSeason}
                onChange={handleInputChange}
                placeholder="e.g., April to September"
              />
            </div>
            <div className="form-group">
              <label>Daily Visitor Capacity</label>
              <input
                type="number"
                name="dailyVisitorCapacity"
                value={formData.dailyVisitorCapacity}
                onChange={handleInputChange}
                placeholder="Enter daily capacity"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Maximum Group Size</label>
              <input
                type="number"
                name="maxGroupSize"
                value={formData.maxGroupSize}
                onChange={handleInputChange}
                placeholder="Enter max group size"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="form-section">
          <h4>Contact Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Enter website URL"
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                placeholder="Enter emergency contact"
              />
            </div>
          </div>
        </div>

        {/* Transportation Section */}
        <div className="form-section">
          <h4>Transportation & Distances</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Nearest Airport</label>
              <input
                type="text"
                name="nearestAirport"
                value={formData.nearestAirport}
                onChange={handleInputChange}
                placeholder="Enter nearest airport"
              />
            </div>
            <div className="form-group">
              <label>Distance from Airport</label>
              <input
                type="text"
                name="distanceFromAirport"
                value={formData.distanceFromAirport}
                onChange={handleInputChange}
                placeholder="e.g., 50 km"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nearest Railway Station</label>
              <input
                type="text"
                name="nearestRailway"
                value={formData.nearestRailway}
                onChange={handleInputChange}
                placeholder="Enter nearest railway station"
              />
            </div>
            <div className="form-group">
              <label>Distance from Railway</label>
              <input
                type="text"
                name="distanceFromRailway"
                value={formData.distanceFromRailway}
                onChange={handleInputChange}
                placeholder="e.g., 25 km"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nearest Bus Stand</label>
              <input
                type="text"
                name="nearestBusStand"
                value={formData.nearestBusStand}
                onChange={handleInputChange}
                placeholder="Enter nearest bus stand"
              />
            </div>
            <div className="form-group">
              <label>Distance from Bus Stand</label>
              <input
                type="text"
                name="distanceFromBusStand"
                value={formData.distanceFromBusStand}
                onChange={handleInputChange}
                placeholder="e.g., 10 km"
              />
            </div>
          </div>
        </div>

        {/* Facilities Section */}
        <div className="form-section">
          <h4>Facilities & Amenities</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Parking Available</label>
              <input
                type="text"
                name="parkingAvailable"
                value={formData.parkingAvailable}
                onChange={handleInputChange}
                placeholder="e.g., Yes, 100 cars"
              />
            </div>
            <div className="form-group">
              <label>Restroom Facilities</label>
              <input
                type="text"
                name="restroomFacilities"
                value={formData.restroomFacilities}
                onChange={handleInputChange}
                placeholder="e.g., Available at entrance"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Drinking Water</label>
              <input
                type="text"
                name="drinkingWater"
                value={formData.drinkingWater}
                onChange={handleInputChange}
                placeholder="e.g., Available at multiple points"
              />
            </div>
            <div className="form-group">
              <label>First Aid Facility</label>
              <input
                type="text"
                name="firstAidFacility"
                value={formData.firstAidFacility}
                onChange={handleInputChange}
                placeholder="e.g., Available at entrance"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Souvenir Shop</label>
              <input
                type="text"
                name="souvenirShop"
                value={formData.souvenirShop}
                onChange={handleInputChange}
                placeholder="e.g., Available at exit"
              />
            </div>
            <div className="form-group">
              <label>Food Court</label>
              <input
                type="text"
                name="foodCourt"
                value={formData.foodCourt}
                onChange={handleInputChange}
                placeholder="e.g., Available at entrance"
              />
            </div>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="form-section">
          <h4>Accessibility & Special Needs</h4>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="wheelchairAccessible"
                  checked={formData.wheelchairAccessible}
                  onChange={handleInputChange}
                />
                Wheelchair Accessible
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="seniorCitizenFriendly"
                  checked={formData.seniorCitizenFriendly}
                  onChange={handleInputChange}
                />
                Senior Citizen Friendly
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="childFriendly"
                  checked={formData.childFriendly}
                  onChange={handleInputChange}
                />
                Child Friendly
              </label>
            </div>
          </div>
        </div>

        {/* Photography & Rules Section */}
        <div className="form-section">
          <h4>Photography & Rules</h4>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="photographyAllowed"
                  checked={formData.photographyAllowed}
                  onChange={handleInputChange}
                />
                Photography Allowed
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="dronePhotographyAllowed"
                  checked={formData.dronePhotographyAllowed}
                  onChange={handleInputChange}
                />
                Drone Photography Allowed
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="flashPhotographyAllowed"
                  checked={formData.flashPhotographyAllowed}
                  onChange={handleInputChange}
                />
                Flash Photography Allowed
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="tripodAllowed"
                  checked={formData.tripodAllowed}
                  onChange={handleInputChange}
                />
                Tripod Allowed
              </label>
            </div>
          </div>
        </div>

        {/* Permits & Booking Section */}
        <div className="form-section">
          <h4>Permits & Booking</h4>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="advanceBookingRequired"
                  checked={formData.advanceBookingRequired}
                  onChange={handleInputChange}
                />
                Advance Booking Required
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="onlineBookingAvailable"
                  checked={formData.onlineBookingAvailable}
                  onChange={handleInputChange}
                />
                Online Booking Available
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="permitRequired"
                  checked={formData.permitRequired}
                  onChange={handleInputChange}
                />
                Special Permit Required
              </label>
            </div>
            <div className="form-group">
              <label>Permit Fee (₹)</label>
              <input
                type="number"
                name="permitFee"
                value={formData.permitFee}
                onChange={handleInputChange}
                placeholder="Enter permit fee"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Permit Validity</label>
              <input
                type="text"
                name="permitValidity"
                value={formData.permitValidity}
                onChange={handleInputChange}
                placeholder="e.g., 1 day, 1 week"
              />
            </div>
          </div>
        </div>

        {/* Visitor Guidelines Section */}
        <div className="form-section">
          <h4>Visitor Guidelines</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Dress Code</label>
              <textarea
                name="dressCode"
                value={formData.dressCode}
                onChange={handleInputChange}
                placeholder="Describe dress code requirements"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>What to Carry</label>
              <textarea
                name="whatToCarry"
                value={formData.whatToCarry}
                onChange={handleInputChange}
                placeholder="List items visitors should carry"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>What Not to Carry</label>
              <textarea
                name="whatNotToCarry"
                value={formData.whatNotToCarry}
                onChange={handleInputChange}
                placeholder="List prohibited items"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Safety Guidelines</label>
              <textarea
                name="safetyGuidelines"
                value={formData.safetyGuidelines}
                onChange={handleInputChange}
                placeholder="Enter safety guidelines"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Rules & Regulations</label>
            <textarea
              name="rulesAndRegulations"
              value={formData.rulesAndRegulations}
              onChange={handleInputChange}
              placeholder="Enter rules and regulations"
              rows="4"
            />
          </div>
        </div>

        {/* Weather & Climate Section */}
        <div className="form-section">
          <h4>Weather & Climate</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Temperature Range</label>
              <input
                type="text"
                name="temperatureRange"
                value={formData.temperatureRange}
                onChange={handleInputChange}
                placeholder="e.g., 15°C to 35°C"
              />
            </div>
            <div className="form-group">
              <label>Monsoon Information</label>
              <input
                type="text"
                name="monsoonInfo"
                value={formData.monsoonInfo}
                onChange={handleInputChange}
                placeholder="e.g., June to September"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Weather Information</label>
            <textarea
              name="weatherInfo"
              value={formData.weatherInfo}
              onChange={handleInputChange}
              placeholder="Describe weather patterns and climate"
              rows="4"
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h4>Additional Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                placeholder="Any special instructions for visitors"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Important Notes</label>
              <textarea
                name="importantNotes"
                value={formData.importantNotes}
                onChange={handleInputChange}
                placeholder="Important notes for visitors"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Cancellation Policy</label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                placeholder="Describe cancellation policy"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Refund Policy</label>
              <textarea
                name="refundPolicy"
                value={formData.refundPolicy}
                onChange={handleInputChange}
                placeholder="Describe refund policy"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            <i className="fas fa-times"></i> Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            <i className="fas fa-save"></i> {loading ? 'Saving...' : (editingData ? 'Update' : 'Save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm; 