#!/usr/bin/env python3
"""Expand quizzes to 10+ questions and add teams field."""
import json, os

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'quizzes')

ADDITIONS = {
  'team-argentina': {
    'teams': ['Argentina'],
    'questions': [
      {
        'q': 'Emiliano Martínez won which award at the 2022 World Cup?',
        'options': ['Golden Boot', 'Golden Ball', 'Golden Glove', 'Silver Boot'],
        'answer': 2,
        'explain': "Martínez was outstanding throughout, saving crucial penalties and winning the Golden Glove for the tournament's best goalkeeper."
      },
      {
        'q': 'In which year did Argentina make their World Cup debut?',
        'options': ['1930', '1934', '1938', '1950'],
        'answer': 0,
        'explain': "Argentina played in the very first World Cup in 1930, reaching the final before losing 4–2 to hosts Uruguay."
      }
    ]
  },
  'team-brazil': {
    'teams': ['Brazil'],
    'questions': [
      {
        'q': "Who is Brazil's all-time leading scorer at World Cups?",
        'options': ['Pelé', 'Ronaldo', 'Rivaldo', 'Romário'],
        'answer': 1,
        'explain': "Ronaldo (R9) scored 15 World Cup goals across 1998, 2002 and 2006, making him Brazil's all-time top scorer at the tournament."
      },
      {
        'q': 'Brazil famously wear yellow shirts. What colour did they originally wear before changing after a 1950 shock defeat?',
        'options': ['Green', 'White', 'Blue', 'Red'],
        'answer': 1,
        'explain': "Brazil wore white in the 1950 World Cup final and lost to Uruguay. The public was devastated and the team adopted their iconic yellow kit to symbolise a fresh start."
      }
    ]
  },
  'team-england': {
    'teams': ['England'],
    'questions': [
      {
        'q': "Geoff Hurst's controversial second goal in the 1966 final — what was disputed?",
        'options': ['It was offside', 'The ball crossed the line', 'It was a handball', 'Hurst was fouled'],
        'answer': 1,
        'explain': "Hurst's shot hit the crossbar and bounced down. The linesman ruled it had crossed the line, but the debate continues more than 50 years on."
      },
      {
        'q': 'Who was England manager when they reached the 2018 World Cup semi-finals?',
        'options': ['Roy Hodgson', 'Sam Allardyce', 'Gareth Southgate', 'Steve McClaren'],
        'answer': 2,
        'explain': "Gareth Southgate led England to the 2018 semi-finals in Russia — their first semi-final appearance since 1990 — before losing to Croatia."
      }
    ]
  },
  'team-france': {
    'teams': ['France'],
    'questions': [
      {
        'q': "Who scored France's third goal in the 1998 World Cup final to seal a 3–0 win?",
        'options': ['Zidane', 'Thierry Henry', 'Emmanuel Petit', 'David Trezeguet'],
        'answer': 2,
        'explain': "Defensive midfielder Emmanuel Petit capped France's historic 3–0 win over Brazil by finishing a counter-attack in the closing minutes."
      },
      {
        'q': 'France crashed out of the group stage as defending champions in which two World Cups?',
        'options': ['2002 and 2010', '2002 and 2014', '1994 and 2010', '2006 and 2014'],
        'answer': 0,
        'explain': "France were eliminated in the group stage in both 2002 (scoring zero goals as holders) and 2010 amid a player revolt that shocked the football world."
      }
    ]
  },
  'team-germany': {
    'teams': ['Germany'],
    'questions': [
      {
        'q': 'Manuel Neuer won which award at the 2014 World Cup?',
        'options': ['Golden Boot', 'Golden Ball', 'Golden Glove', 'Silver Boot'],
        'answer': 2,
        'explain': "Neuer won the Golden Glove for the tournament's best goalkeeper at Brazil 2014, having revolutionised the role with his sweeper-keeper play."
      },
      {
        'q': 'Who scored the winner for West Germany in the 1974 World Cup final against the Netherlands?',
        'options': ['Franz Beckenbauer', 'Sepp Maier', 'Gerd Müller', 'Berti Vogts'],
        'answer': 2,
        'explain': "Gerd Müller scored the decisive 2–1 winner four minutes from time, completing West Germany's comeback after the Netherlands had taken an early lead."
      }
    ]
  },
  'team-spain': {
    'teams': ['Spain'],
    'questions': [
      {
        'q': "Who was Spain's top scorer at the 2010 World Cup with five goals?",
        'options': ['Fernando Torres', 'Andrés Iniesta', 'David Villa', 'Xavi'],
        'answer': 2,
        'explain': "David Villa was Spain's standout striker with five goals across the tournament, including strikes against Portugal, Paraguay and Chile."
      },
      {
        'q': 'Which city hosted the 2010 World Cup final where Spain beat the Netherlands?',
        'options': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
        'answer': 1,
        'explain': "The 2010 final was played at Soccer City (now FNB Stadium) in Johannesburg — the largest stadium in Africa — where Iniesta struck in extra time."
      }
    ]
  },
  'player-messi': {
    'teams': ['Argentina'],
    'questions': [
      {
        'q': 'How many World Cup tournaments has Messi appeared in?',
        'options': ['3', '4', '5', '6'],
        'answer': 2,
        'explain': "Messi competed at five World Cups: 2006, 2010, 2014, 2018 and 2022 — one of only a handful of players to appear in five editions."
      },
      {
        'q': 'At the 2014 World Cup, Messi won which individual award despite Argentina losing the final?',
        'options': ['Golden Boot', 'Golden Glove', 'Golden Ball', 'Silver Boot'],
        'answer': 2,
        'explain': "Messi was controversially awarded the Golden Ball as the tournament's best player at Brazil 2014, even though Argentina lost the final 1–0 to Germany."
      }
    ]
  },
  'player-ronaldo-cr7': {
    'teams': ['Portugal'],
    'questions': [
      {
        'q': 'How many goals has Ronaldo scored across all his World Cup appearances?',
        'options': ['6', '7', '8', '10'],
        'answer': 2,
        'explain': "Ronaldo has scored 8 World Cup goals in total — spanning the 2006, 2010, 2014, 2018 (including a hat-trick vs Spain) and 2022 tournaments."
      },
      {
        'q': 'Which award did a teenage Ronaldo win at the 2006 World Cup?',
        'options': ['Golden Boot', 'Best Young Player', 'Golden Ball', 'Golden Glove'],
        'answer': 1,
        'explain': "Ronaldo won the Best Young Player award at Germany 2006, his debut World Cup, as Portugal reached the semi-finals."
      }
    ]
  },
  'legends-maradona-pele': {
    'teams': ['Argentina', 'Brazil'],
    'questions': [
      {
        'q': 'Diego Maradona managed which national team at the 2010 World Cup?',
        'options': ['Italy', 'Brazil', 'Argentina', 'Spain'],
        'answer': 2,
        'explain': "Maradona managed Argentina at the 2010 World Cup in South Africa, where they reached the quarter-finals before losing 4–0 to Germany."
      },
      {
        'q': "In which World Cup did Pelé lift the trophy for the last time?",
        'options': ['1958', '1962', '1966', '1970'],
        'answer': 3,
        'explain': "Pelé's final World Cup was 1970 in Mexico, where Brazil played some of the most beautiful football ever seen. He lifted the trophy for the third and final time."
      }
    ]
  },
  'wc-finals': {
    'questions': [
      {
        'q': 'Who scored the only goal of the 1990 World Cup final for West Germany?',
        'options': ['Rudi Völler', 'Lothar Matthäus', 'Andreas Brehme', 'Jürgen Klinsmann'],
        'answer': 2,
        'explain': "Andreas Brehme scored from the penalty spot to give West Germany a 1–0 win over Argentina in Rome — a rematch of the 1986 final."
      },
      {
        'q': 'Where was the 1970 World Cup final held, where Brazil beat Italy 4–1?',
        'options': ['Rio de Janeiro', 'Mexico City', 'Buenos Aires', 'Madrid'],
        'answer': 1,
        'explain': "The 1970 final was played at the Estadio Azteca in Mexico City. Brazil's dazzling performance and Pelé's goal made it one of the greatest finals ever."
      }
    ]
  },
  'wc-upsets': {
    'questions': [
      {
        'q': 'Japan beat both Germany and Spain at the 2022 World Cup. Who did Japan lose to in the same group?',
        'options': ['Belgium', 'Morocco', 'Costa Rica', 'Canada'],
        'answer': 2,
        'explain': "Japan beat Germany 2–1 and Spain 2–1 to top Group E, but suffered a 1–0 defeat to Costa Rica sandwiched between those historic victories."
      },
      {
        'q': 'Which country beat eventual 2010 World Cup champions Spain in the group stage?',
        'options': ['Chile', 'Honduras', 'Portugal', 'Switzerland'],
        'answer': 3,
        'explain': "Switzerland beat Spain 1–0 in the group stage, one of the biggest group-stage shocks of the tournament. Spain recovered to win all remaining games and lift the trophy."
      }
    ]
  },
  'wc-iconic-moments': {
    'questions': [
      {
        'q': 'Which Cameroonian striker became famous for his corner-flag celebrations at the 1990 World Cup?',
        'options': ['Samuel Eto\'o', 'Patrick Mboma', 'Roger Milla', 'Rigobert Song'],
        'answer': 2,
        'explain': "Roger Milla came out of retirement at age 38 to become the star of Italia 90, scoring four goals and dancing around the corner flag with infectious joy."
      },
      {
        'q': 'Dennis Bergkamp scored a stunning 90th-minute winner in the 1998 quarter-final against which team?',
        'options': ['Brazil', 'France', 'Germany', 'Argentina'],
        'answer': 3,
        'explain': "Bergkamp's iconic three-touch control and finish in the final seconds against Argentina in 1998 is widely regarded as one of the greatest World Cup goals of all time."
      }
    ]
  },
  'wc-golden-boot': {
    'questions': [
      {
        'q': "Davor Šuker's six goals in 1998 helped Croatia finish in which position?",
        'options': ['Champions', 'Runners-up', 'Third place', 'Fourth place'],
        'answer': 2,
        'explain': "Croatia finished third at their debut World Cup in 1998, with Šuker's Golden Boot performance inspiring their remarkable run all the way to the third-place play-off."
      },
      {
        'q': 'At the 2010 World Cup, four players finished level on five goals. Who was awarded the Golden Boot?',
        'options': ['David Villa', 'Diego Forlán', 'Wesley Sneijder', 'Thomas Müller'],
        'answer': 3,
        'explain': "Thomas Müller won the Golden Boot after tiebreakers, having recorded 3 assists alongside his 5 goals — more than the other tied scorers."
      }
    ]
  },
  'wc-hosts': {
    'questions': [
      {
        'q': 'Which country hosted the 1994 World Cup, the first to be decided in a penalty shootout final?',
        'options': ['Canada', 'Mexico', 'USA', 'Colombia'],
        'answer': 2,
        'explain': "The USA hosted the 1994 World Cup — the first held in North America. Brazil beat Italy 3–2 on penalties in the Rose Bowl, the first World Cup final decided by a shootout."
      },
      {
        'q': 'Italy hosted and won the World Cup in which year?',
        'options': ['1930', '1934', '1950', '1966'],
        'answer': 1,
        'explain': "Italy hosted and won the 1934 World Cup under coach Vittorio Pozzo, becoming the first host nation to win the tournament. They also defended their title in France in 1938."
      }
    ]
  },
  'wc-records': {
    'questions': [
      {
        'q': 'What is the record number of goals scored by one team in a single World Cup match?',
        'options': ['8', '9', '10', '12'],
        'answer': 2,
        'explain': "Hungary beat El Salvador 10–1 in the 1982 World Cup group stage — the highest single-team score and the highest-scoring match in World Cup history."
      },
      {
        'q': 'The original World Cup trophy was named the Jules Rimet Trophy. Which nation permanently kept it after winning three times?',
        'options': ['Argentina', 'Germany', 'Brazil', 'Italy'],
        'answer': 2,
        'explain': "Brazil won the Jules Rimet Trophy outright after their third World Cup victory in 1970. A new FIFA World Cup Trophy was commissioned starting from the 1974 tournament."
      }
    ]
  },
  'wc-2026-host-cities': {
    'questions': [
      {
        'q': 'MetLife Stadium, hosting the 2026 final, is located in which US state?',
        'options': ['New York', 'Connecticut', 'New Jersey', 'Pennsylvania'],
        'answer': 2,
        'explain': "Despite its New York branding, MetLife Stadium is in East Rutherford, New Jersey — just across the Hudson River from Manhattan."
      },
      {
        'q': "Azteca Stadium in Mexico City has hosted two previous World Cup finals. In which years?",
        'options': ['1958 and 1970', '1970 and 1986', '1966 and 1970', '1986 and 1994'],
        'answer': 1,
        'explain': "Azteca hosted the 1970 final (Brazil 4–1 Italy) and the 1986 final (Argentina 3–2 West Germany), making it the only stadium to host two World Cup finals."
      }
    ]
  },
  'wc-2026-explainer': {
    'questions': [
      {
        'q': 'How many matches does each team play in the 2026 group stage?',
        'options': ['2', '3', '4', '5'],
        'answer': 1,
        'explain': "Each team plays 3 group-stage matches. The 48 teams are split into 12 groups of four, with each team facing the other three in their group before the knockout rounds."
      },
      {
        'q': 'Canada is a 2026 co-host. How many World Cups had they previously qualified for as a participant?',
        'options': ['0', '1', '2', '3'],
        'answer': 1,
        'explain': "Canada qualified for just one World Cup before 2026 — the 1986 tournament in Mexico, where they went out in the group stage without scoring a single goal."
      }
    ]
  },
}

for slug, data in ADDITIONS.items():
  path = os.path.join(BASE, f'{slug}.json')
  with open(path) as f:
    quiz = json.load(f)

  if 'teams' in data:
    quiz['teams'] = data['teams']

  quiz['questions'].extend(data['questions'])

  with open(path, 'w') as f:
    json.dump(quiz, f, indent=2, ensure_ascii=False)

  print(f"✅ {slug}: {len(quiz['questions'])} questions")

print('\nDone.')
