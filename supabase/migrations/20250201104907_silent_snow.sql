/*
  # Create games table for online multiplayer

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `pieces` (jsonb, stores game pieces)
      - `current_turn` (text, 'red' or 'blue')
      - `players` (jsonb, stores player IDs)
      - `winner` (text, optional)
      - `last_updated` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for game access
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pieces jsonb NOT NULL,
  current_turn text NOT NULL CHECK (current_turn IN ('red', 'blue')),
  players jsonb NOT NULL,
  winner text CHECK (winner IN ('red', 'blue')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a game"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (players->>'red')::uuid 
    OR auth.uid() = (players->>'blue')::uuid
  );

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  TO authenticated
  USING (true);