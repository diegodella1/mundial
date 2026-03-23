-- 005_seed_matches.sql
-- Seed all 72 FIFA World Cup 2026 group stage matches
-- Times converted from ET (UTC-4) to UTC

INSERT INTO matches (home_team, away_team, home_code, away_code, kickoff_at, group_name, round) VALUES

-- === June 11 ===
('Mexico',              'South Africa',         'MEX', 'RSA', '2026-06-11 17:00:00+00', 'A', 'group'),
('South Korea',         'UEFA Path D Winner',   'KOR', 'UD1', '2026-06-12 00:00:00+00', 'A', 'group'),

-- === June 12 ===
('Canada',              'UEFA Path A Winner',   'CAN', 'UA1', '2026-06-12 19:00:00+00', 'B', 'group'),
('USA',                 'Paraguay',             'USA', 'PAR', '2026-06-13 01:00:00+00', 'D', 'group'),

-- === June 13 ===
('Brazil',              'Morocco',              'BRA', 'MAR', '2026-06-13 22:00:00+00', 'C', 'group'),
('Australia',           'UEFA Path C Winner',   'AUS', 'UC1', '2026-06-14 01:00:00+00', 'D', 'group'),
('Haiti',               'Scotland',             'HAI', 'SCO', '2026-06-13 22:00:00+00', 'C', 'group'),
('Qatar',               'Switzerland',          'QAT', 'SUI', '2026-06-13 18:00:00+00', 'B', 'group'),

-- === June 14 ===
('Germany',             'Curaçao',              'GER', 'CUW', '2026-06-14 16:00:00+00', 'E', 'group'),
('Ivory Coast',         'Ecuador',              'CIV', 'ECU', '2026-06-14 23:00:00+00', 'E', 'group'),
('Netherlands',         'Japan',                'NED', 'JPN', '2026-06-14 19:00:00+00', 'F', 'group'),
('UEFA Path B Winner',  'Tunisia',              'UB1', 'TUN', '2026-06-15 00:00:00+00', 'F', 'group'),

-- === June 15 ===
('Spain',               'Cape Verde',           'ESP', 'CPV', '2026-06-15 16:00:00+00', 'H', 'group'),
('Saudi Arabia',        'Uruguay',              'KSA', 'URU', '2026-06-15 22:00:00+00', 'H', 'group'),
('Belgium',             'Egypt',                'BEL', 'EGY', '2026-06-15 16:00:00+00', 'G', 'group'),
('Iran',                'New Zealand',          'IRN', 'NZL', '2026-06-15 22:00:00+00', 'G', 'group'),

-- === June 16 ===
('France',              'Senegal',              'FRA', 'SEN', '2026-06-16 19:00:00+00', 'I', 'group'),
('IC Path 2 Winner',    'Norway',               'IC2', 'NOR', '2026-06-16 22:00:00+00', 'I', 'group'),
('Argentina',           'Algeria',              'ARG', 'ALG', '2026-06-17 00:00:00+00', 'J', 'group'),
('Austria',             'Jordan',               'AUT', 'JOR', '2026-06-17 01:00:00+00', 'J', 'group'),

-- === June 17 ===
('England',             'Croatia',              'ENG', 'CRO', '2026-06-17 19:00:00+00', 'L', 'group'),
('Ghana',               'Panama',               'GHA', 'PAN', '2026-06-17 23:00:00+00', 'L', 'group'),
('Portugal',            'IC Path 1 Winner',     'POR', 'IC1', '2026-06-17 16:00:00+00', 'K', 'group'),
('Uzbekistan',          'Colombia',             'UZB', 'COL', '2026-06-18 00:00:00+00', 'K', 'group'),

-- === June 18 ===
('UEFA Path D Winner',  'South Africa',         'UD1', 'RSA', '2026-06-18 16:00:00+00', 'A', 'group'),
('Switzerland',         'UEFA Path A Winner',   'SUI', 'UA1', '2026-06-18 16:00:00+00', 'B', 'group'),
('Canada',              'Qatar',                'CAN', 'QAT', '2026-06-18 19:00:00+00', 'B', 'group'),
('Mexico',              'South Korea',          'MEX', 'KOR', '2026-06-18 23:00:00+00', 'A', 'group'),

-- === June 19 ===
('Brazil',              'Haiti',                'BRA', 'HAI', '2026-06-20 01:00:00+00', 'C', 'group'),
('Scotland',            'Morocco',              'SCO', 'MAR', '2026-06-19 22:00:00+00', 'C', 'group'),
('UEFA Path C Winner',  'Paraguay',             'UC1', 'PAR', '2026-06-20 01:00:00+00', 'D', 'group'),
('USA',                 'Australia',            'USA', 'AUS', '2026-06-19 16:00:00+00', 'D', 'group'),

-- === June 20 ===
('Germany',             'Ivory Coast',          'GER', 'CIV', '2026-06-20 20:00:00+00', 'E', 'group'),
('Ecuador',             'Curaçao',              'ECU', 'CUW', '2026-06-20 23:00:00+00', 'E', 'group'),
('Netherlands',         'UEFA Path B Winner',   'NED', 'UB1', '2026-06-20 16:00:00+00', 'F', 'group'),
('Tunisia',             'Japan',                'TUN', 'JPN', '2026-06-21 02:00:00+00', 'F', 'group'),

-- === June 21 ===
('Spain',               'Saudi Arabia',         'ESP', 'KSA', '2026-06-21 16:00:00+00', 'H', 'group'),
('Uruguay',             'Cape Verde',           'URU', 'CPV', '2026-06-21 22:00:00+00', 'H', 'group'),
('Belgium',             'Iran',                 'BEL', 'IRN', '2026-06-21 16:00:00+00', 'G', 'group'),
('New Zealand',         'Egypt',                'NZL', 'EGY', '2026-06-21 22:00:00+00', 'G', 'group'),

-- === June 22 ===
('France',              'IC Path 2 Winner',     'FRA', 'IC2', '2026-06-22 21:00:00+00', 'I', 'group'),
('Norway',              'Senegal',              'NOR', 'SEN', '2026-06-23 00:00:00+00', 'I', 'group'),
('Argentina',           'Austria',              'ARG', 'AUT', '2026-06-22 16:00:00+00', 'J', 'group'),
('Jordan',              'Algeria',              'JOR', 'ALG', '2026-06-23 00:00:00+00', 'J', 'group'),

-- === June 23 ===
('England',             'Ghana',                'ENG', 'GHA', '2026-06-23 20:00:00+00', 'L', 'group'),
('Panama',              'Croatia',              'PAN', 'CRO', '2026-06-23 23:00:00+00', 'L', 'group'),
('Portugal',            'Uzbekistan',           'POR', 'UZB', '2026-06-23 16:00:00+00', 'K', 'group'),
('Colombia',            'IC Path 1 Winner',     'COL', 'IC1', '2026-06-24 00:00:00+00', 'K', 'group'),

-- === June 24 ===
('Scotland',            'Brazil',               'SCO', 'BRA', '2026-06-24 22:00:00+00', 'C', 'group'),
('Morocco',             'Haiti',                'MAR', 'HAI', '2026-06-24 22:00:00+00', 'C', 'group'),
('Switzerland',         'Canada',               'SUI', 'CAN', '2026-06-24 16:00:00+00', 'B', 'group'),
('UEFA Path A Winner',  'Qatar',                'UA1', 'QAT', '2026-06-24 16:00:00+00', 'B', 'group'),
('UEFA Path D Winner',  'Mexico',               'UD1', 'MEX', '2026-06-24 23:00:00+00', 'A', 'group'),
('South Africa',        'South Korea',          'RSA', 'KOR', '2026-06-24 23:00:00+00', 'A', 'group'),

-- === June 25 ===
('Ecuador',             'Germany',              'ECU', 'GER', '2026-06-25 23:00:00+00', 'E', 'group'),
('Curaçao',             'Ivory Coast',          'CUW', 'CIV', '2026-06-25 20:00:00+00', 'E', 'group'),
('Tunisia',             'Netherlands',          'TUN', 'NED', '2026-06-25 22:00:00+00', 'F', 'group'),
('Japan',               'UEFA Path B Winner',   'JPN', 'UB1', '2026-06-25 22:00:00+00', 'F', 'group'),
('UEFA Path C Winner',  'USA',                  'UC1', 'USA', '2026-06-25 23:00:00+00', 'D', 'group'),
('Paraguay',            'Australia',            'PAR', 'AUS', '2026-06-25 23:00:00+00', 'D', 'group'),

-- === June 26 ===
('Norway',              'France',               'NOR', 'FRA', '2026-06-26 19:00:00+00', 'I', 'group'),
('Senegal',             'IC Path 2 Winner',     'SEN', 'IC2', '2026-06-26 19:00:00+00', 'I', 'group'),
('New Zealand',         'Belgium',              'NZL', 'BEL', '2026-06-27 00:00:00+00', 'G', 'group'),
('Egypt',               'Iran',                 'EGY', 'IRN', '2026-06-27 00:00:00+00', 'G', 'group'),
('Uruguay',             'Spain',                'URU', 'ESP', '2026-06-26 22:00:00+00', 'H', 'group'),
('Cape Verde',          'Saudi Arabia',         'CPV', 'KSA', '2026-06-26 23:00:00+00', 'H', 'group'),

-- === June 27 ===
('Panama',              'England',              'PAN', 'ENG', '2026-06-27 21:00:00+00', 'L', 'group'),
('Croatia',             'Ghana',                'CRO', 'GHA', '2026-06-27 21:00:00+00', 'L', 'group'),
('Jordan',              'Argentina',            'JOR', 'ARG', '2026-06-28 01:00:00+00', 'J', 'group'),
('Algeria',             'Austria',              'ALG', 'AUT', '2026-06-28 01:00:00+00', 'J', 'group'),
('Colombia',            'Portugal',             'COL', 'POR', '2026-06-27 23:30:00+00', 'K', 'group'),
('IC Path 1 Winner',    'Uzbekistan',           'IC1', 'UZB', '2026-06-27 23:30:00+00', 'K', 'group');
