-- Spur Database Schema
-- PostgreSQL with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255),
    display_name VARCHAR(100),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    bio TEXT,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    location_coordinates POINT, -- PostGIS (lat, lon)
    
    -- Privacy & Settings
    max_friends INTEGER DEFAULT 20 CHECK (max_friends <= 20),
    is_public BOOLEAN DEFAULT FALSE,
    notification_settings JSONB DEFAULT '{"sms": true, "email": true, "push": true}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- FRIENDSHIPS TABLE (Connection between users)
-- ============================================================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status: pending, accepted, blocked
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    
    -- Direction: who initiated
    initiated_by UUID NOT NULL REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT different_users CHECK (user_id_a < user_id_b),
    CONSTRAINT bidirectional_unique UNIQUE(user_id_a, user_id_b)
);

CREATE INDEX idx_friendships_user_a ON friendships(user_id_a);
CREATE INDEX idx_friendships_user_b ON friendships(user_id_b);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ============================================================================
-- STATUSES TABLE (User availability statuses)
-- ============================================================================
CREATE TABLE statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status type: free_now, free_tonight, already_here
    type VARCHAR(50) NOT NULL CHECK (type IN ('free_now', 'free_tonight', 'already_here')),
    
    -- Energy level: low, high
    energy_level VARCHAR(50) NOT NULL DEFAULT 'high' CHECK (energy_level IN ('low', 'high')),
    
    -- Expiration logic
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes IN (60, 180, 720)), -- 1hr, 3hr, 12hr
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Optional location
    location_text VARCHAR(255),
    location_coordinates POINT,
    
    -- Optional context/emoji
    emoji VARCHAR(10),
    context_text VARCHAR(255),
    
    -- Soft delete / expiration handling
    is_active BOOLEAN DEFAULT TRUE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT future_expiration CHECK (expires_at > created_at)
);

CREATE INDEX idx_statuses_user_id ON statuses(user_id);
CREATE INDEX idx_statuses_is_active ON statuses(is_active);
CREATE INDEX idx_statuses_expires_at ON statuses(expires_at);
CREATE INDEX idx_statuses_created_at ON statuses(created_at DESC);
CREATE INDEX idx_statuses_type ON statuses(type);

-- ============================================================================
-- EVENTS TABLE (Claim a Seat - micro events)
-- ============================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event details
    title VARCHAR(255) NOT NULL, -- What: "Tacos", "Coffee", etc
    location_text VARCHAR(255) NOT NULL, -- Where
    location_coordinates POINT,
    spots_available INTEGER NOT NULL CHECK (spots_available > 0),
    spots_claimed INTEGER DEFAULT 0,
    
    -- Associated status (optional)
    status_id UUID REFERENCES statuses(id) ON DELETE SET NULL,
    
    -- Expiration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT spots_not_over CHECK (spots_claimed <= spots_available)
);

CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_expires_at ON events(expires_at);

-- ============================================================================
-- EVENT CLAIMS TABLE (Join a Claim a Seat event)
-- ============================================================================
CREATE TABLE event_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_claim UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_claims_event_id ON event_claims(event_id);
CREATE INDEX idx_event_claims_user_id ON event_claims(user_id);

-- ============================================================================
-- CHATS TABLE (Ephemeral 1-on-1 conversations)
-- ============================================================================
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Associated status
    triggered_by_status_id UUID REFERENCES statuses(id) ON DELETE SET NULL,
    
    -- Auto-delete when status expires
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT different_users CHECK (user_id_a < user_id_b)
);

CREATE INDEX idx_chats_user_a ON chats(user_id_a);
CREATE INDEX idx_chats_user_b ON chats(user_id_b);
CREATE INDEX idx_chats_expires_at ON chats(expires_at);

-- ============================================================================
-- MESSAGES TABLE (Chat messages - ephemeral)
-- ============================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    -- For media (optional)
    media_urls TEXT[], -- Array of media URLs
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification type
    type VARCHAR(100) NOT NULL, -- friend_request, status_update, event_full, etc
    title VARCHAR(255) NOT NULL,
    body TEXT,
    
    -- Related entities
    related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_entity_id UUID,
    related_entity_type VARCHAR(50),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- AUDIT LOGS TABLE (For compliance)
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update `updated_at` on users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Auto-expire statuses
CREATE OR REPLACE FUNCTION auto_expire_statuses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE statuses
    SET is_active = FALSE, expired_at = CURRENT_TIMESTAMP
    WHERE expires_at <= CURRENT_TIMESTAMP AND is_active = TRUE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Schedule a job (use pg_cron extension)
-- SELECT cron.schedule('auto_expire_statuses', '* * * * *', 'SELECT auto_expire_statuses()');

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - For Supabase
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile and friends' profiles
CREATE POLICY "users_can_view_own_profile"
ON users
FOR SELECT
USING (auth.uid()::uuid = id OR is_public = TRUE);

-- Users can only update their own profile
CREATE POLICY "users_can_update_own_profile"
ON users
FOR UPDATE
USING (auth.uid()::uuid = id);

-- Friendships visible to both users
CREATE POLICY "friendships_visible_to_users"
ON friendships
FOR SELECT
USING (auth.uid()::uuid = user_id_a OR auth.uid()::uuid = user_id_b);

-- Statuses visible only to friends
CREATE POLICY "statuses_visible_to_friends"
ON statuses
FOR SELECT
USING (
    user_id = auth.uid()::uuid 
    OR user_id IN (
        SELECT CASE 
            WHEN user_id_a = auth.uid()::uuid THEN user_id_b 
            ELSE user_id_a 
        END
        FROM friendships 
        WHERE status = 'accepted' 
        AND (user_id_a = auth.uid()::uuid OR user_id_b = auth.uid()::uuid)
    )
);

-- Chat messages visible only to chat participants
CREATE POLICY "messages_visible_to_participants"
ON messages
FOR SELECT
USING (
    chat_id IN (
        SELECT id FROM chats 
        WHERE user_id_a = auth.uid()::uuid OR user_id_b = auth.uid()::uuid
    )
);
