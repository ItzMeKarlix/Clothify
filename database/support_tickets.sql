-- Support Tickets Database Schema
-- This schema handles customer support tickets for both admin and employee access

-- Create support ticket categories table
CREATE TABLE IF NOT EXISTS support_ticket_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- e.g., TICK-20231219-001
    customer_id UUID, -- REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for anonymous tickets
    customer_email VARCHAR(255), -- Store email for anonymous tickets
    customer_name VARCHAR(255), -- Store name for anonymous tickets
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'waiting-for-customer', 'resolved', 'closed')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category_id INTEGER REFERENCES support_ticket_categories(id),
    assigned_to UUID, -- REFERENCES auth.users(id), -- admin/employee assigned to ticket
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket responses/replies table
CREATE TABLE IF NOT EXISTS ticket_responses (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL, -- REFERENCES auth.users(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- internal notes not visible to customer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket attachments table (for future file uploads)
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    response_id INTEGER REFERENCES ticket_responses(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL, -- REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category_id ON support_tickets(category_id);

CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_responder_id ON ticket_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_ticket_responses_created_at ON ticket_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE support_ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Support ticket categories: readable by all authenticated users
CREATE POLICY "Support ticket categories are viewable by authenticated users" ON support_ticket_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Support tickets policies
-- Allow anyone to create tickets (for anonymous support)
CREATE POLICY "Allow anyone to create tickets" ON support_tickets
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view their own tickets
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (
        auth.uid() = customer_id OR
        customer_email = (auth.jwt() ->> 'email')
    );

-- Allow admins and employees to manage all tickets
CREATE POLICY "Admins and employees can manage tickets" ON support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Ticket responses policies
CREATE POLICY "Users can view responses to their tickets" ON ticket_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_responses.ticket_id
            AND (support_tickets.customer_id = auth.uid() OR support_tickets.customer_email = (auth.jwt() ->> 'email'))
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "Admins and employees can manage responses" ON ticket_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Ticket attachments policies
CREATE POLICY "Users can view attachments to their tickets" ON ticket_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_attachments.ticket_id
            AND (support_tickets.customer_id = auth.uid() OR support_tickets.customer_email = (auth.jwt() ->> 'email'))
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "Admins and employees can manage attachments" ON ticket_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Insert default ticket categories
INSERT INTO support_ticket_categories (name, description) VALUES
    ('General Inquiry', 'General questions and information requests'),
    ('Order Issue', 'Problems with orders, shipping, or delivery'),
    ('Product Question', 'Questions about products, sizing, or specifications'),
    ('Return/Exchange', 'Return and exchange requests'),
    ('Account Issue', 'Problems with account access or settings'),
    ('Technical Support', 'Technical issues with the website or app'),
    ('Billing/Payment', 'Payment and billing related issues'),
    ('Other', 'Other types of support requests')
ON CONFLICT (name) DO NOTHING;

-- Functions and Triggers

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    ticket_num TEXT;
BEGIN
    -- Generate ticket number using current timestamp for uniqueness
    ticket_num := 'TICK-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISSMS');

    NEW.ticket_number := ticket_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- Triggers to update timestamps
CREATE TRIGGER trigger_update_ticket_timestamp
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();

CREATE TRIGGER trigger_update_response_timestamp
    BEFORE UPDATE ON ticket_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();