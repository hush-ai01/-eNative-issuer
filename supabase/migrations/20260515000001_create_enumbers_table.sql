create table if not exists public.enumbers (id uuid primary key default uuid_generate_v4(), number text not null unique, did text, created_at timestamp with time zone default timezone('utc'::text, now()) not null, updated_at timestamp with time zone default timezone('utc'::text, now()) not null);

create function public.update_updated_at_column() returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language 'plpgsql';
drop trigger if exists update_enumbers_updated_at on public.enumbers; create trigger update_enumbers_updated_at before update on public.enumbers for each row execute procedure public.update_updated_at_column();

