-- Drop existing foreign key constraints
ALTER TABLE hotels 
DROP FOREIGN KEY fk_hotel_state;

ALTER TABLE state_images 
DROP FOREIGN KEY state_images_ibfk_1;

ALTER TABLE state_history 
DROP FOREIGN KEY state_history_ibfk_1;

-- Add back constraints with CASCADE DELETE
ALTER TABLE hotels 
ADD CONSTRAINT fk_hotel_state 
FOREIGN KEY (state_id) 
REFERENCES states(id) 
ON DELETE CASCADE;

ALTER TABLE state_images 
ADD CONSTRAINT state_images_ibfk_1 
FOREIGN KEY (state_id) 
REFERENCES states(id) 
ON DELETE CASCADE;

ALTER TABLE state_history 
ADD CONSTRAINT state_history_ibfk_1 
FOREIGN KEY (state_id) 
REFERENCES states(id) 
ON DELETE CASCADE; 