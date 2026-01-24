-- Migration: Add position column to tracks table
-- Run this in your Supabase SQL editor

-- Add position column to tracks table
ALTER TABLE tracks ADD COLUMN position TEXT;

-- Populate existing tracks with initial positions using fractional indexing
-- This uses the same character set as the fractional-indexing library
UPDATE tracks 
SET position = generate_key_between(NULL, NULL, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_`{|}~')
WHERE position IS NULL;

-- Create index for performance on folder_id + position queries
CREATE INDEX idx_tracks_folder_position ON tracks(folder_id, position);

-- No timestamp columns needed - simplified track schema