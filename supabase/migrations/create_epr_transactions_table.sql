-- Create EPR transactions table for company credit purchases
CREATE TABLE IF NOT EXISTS epr_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_purchased INTEGER NOT NULL CHECK (credits_purchased > 0),
  amount_paid DECIMAL(12,2) NOT NULL CHECK (amount_paid > 0),
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  package_type TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_epr_transactions_company_id ON epr_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_epr_transactions_date ON epr_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_epr_transactions_status ON epr_transactions(status);

-- Enable Row Level Security
ALTER TABLE epr_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for companies to only see their own transactions
CREATE POLICY "Companies can view own transactions" ON epr_transactions
  FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Companies can insert own transactions" ON epr_transactions
  FOR INSERT WITH CHECK (auth.uid() = company_id);

-- Create policy for admins to see all transactions
CREATE POLICY "Admins can view all transactions" ON epr_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_epr_transactions_updated_at 
  BEFORE UPDATE ON epr_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some demo data
INSERT INTO epr_transactions (company_id, credits_purchased, amount_paid, package_type, status) VALUES 
  ('demo-company-id', 500, 65000.00, 'Professional Package', 'completed'),
  ('demo-company-id', 250, 35000.00, 'Starter Package', 'completed'),
  ('demo-company-id', 100, 15000.00, 'Starter Package', 'completed');
