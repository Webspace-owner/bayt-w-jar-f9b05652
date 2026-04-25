
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings table
CREATE TYPE public.property_type AS ENUM ('apartment', 'villa', 'land', 'shop', 'office');
CREATE TYPE public.listing_purpose AS ENUM ('sale', 'rent');

CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  property_type public.property_type NOT NULL,
  purpose public.listing_purpose NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  area NUMERIC,
  bedrooms INT,
  bathrooms INT,
  contact_phone TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX listings_created_at_idx ON public.listings (created_at DESC);
CREATE INDEX listings_property_type_idx ON public.listings (property_type);
CREATE INDEX listings_purpose_idx ON public.listings (purpose);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
