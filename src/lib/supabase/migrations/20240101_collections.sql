
-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create collection items table
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    book_data JSONB NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(collection_id, book_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    book_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies for Collections
CREATE POLICY "Users can view their own collections" ON public.collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" ON public.collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON public.collections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON public.collections
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for Collection Items
CREATE POLICY "Users can view items in their collections" ON public.collection_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items into their collections" ON public.collection_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their collections" ON public.collection_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

-- Policies for Favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);
