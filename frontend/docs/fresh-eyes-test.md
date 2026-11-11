# Fresh-eyes test

The Project Plan asks for one or two people who have never seen the site to
try five things, so the site is tested by somebody who does not know how it
works. This is the script for that session.

The point is not to see whether the site works. The automated tests and the
audit already say that. The point is to see whether a **stranger** can find
what they need, and to watch where they get stuck.

## Before the session

1. Run the site: `npm run dev`, and open the address it prints. Use the
   **incognito** window or a browser profile that is not signed in.
2. If the session is on a real device, use the network address the terminal
   prints, not `localhost`.
3. Have a pen and paper ready. Write down what the person says, not what
   you think they mean.
4. Do **not** help. No hints, no "try the search box", no pointing at the
   screen. Silence is the useful part.
5. Write down how long each task takes. The times matter as much as the
   answers.

Ask the person to think aloud, and write down every word they say, including
the wrong guesses. Wrong guesses are the most useful thing in the whole
session.

## The five tasks

Say the task in these words, then let them work. If they ask "is this
right?", say "does that answer the question?" and nothing more.

### Task 1: find malaria symptoms

> "I want to know what the symptoms of malaria are. Please find them and
> tell me what they are."

**What counts as a pass:** they reach the malaria disease page and can name
at least two symptoms in their own words.

**Watch for:** the search box being hard to find; the suggestion list
appearing but not being used; landing on the remedy page instead of the
disease page; scrolling past the symptoms without noticing them.

### Task 2: find when to seek care

> "I want to know when I should go and see a health professional for this.
> Please find that."

**What counts as a pass:** they reach the page that says it — the urgent
care box on the disease page, or the remedy page's "when to seek professional
care" section — and they can say when to go.

**Watch for:** the red box being read as decoration; the wording being too
soft to be noticed; the person assuming that a site like this would put
"when to seek care" in a menu.

### Task 3: list respiratory diseases

> "Please list the diseases that belong to the respiratory category."

**What counts as a pass:** they find the categories and list the diseases in
the respiratory category.

**Watch for:** going to the search box instead of the categories; the
category name not matching the word "respiratory" in their head; the count
on the card being confused with the list.

### Task 4: search for something missing

> "Search for a disease that is not on this site — anything you like that
> you know is not here."

**What counts as a pass:** the site says plainly that nothing matched, and
offers a way to keep looking, and the person does not think the site has
broken.

**Watch for:** an empty page with no explanation; an error message that
looks like a failure; the person deciding the search did not work and
trying a different word.

### Task 5: add, edit and delete a disease (admin)

Give the person the admin address and the placeholder sign-in details.
Then:

> "Please add a disease of your own. Give it any name and any description
> you like. When it is saved, please edit it and change something, and then
> delete it."

**What counts as a pass:** they get through add, edit and delete without
being helped, and the site confirms each step.

**Watch for:** the sign-in being mistaken for a real account; the list
being hard to find after saving; the delete confirmation being missed, so
they think the delete did not work; the "add another" button being
mistaken for "save".

## After the session

Write down:

- The time each task took.
- The first thing the person clicked on each task.
- Every place they said "huh?", "where is…", "this doesn't work" or "is
  that right?".
- Every task they could not finish.
- Anything they expected to find that was not there.

Then fix what came up, run `npm test` and `npm run audit` again, and write
down what changed.

## Recording the result

Fill this in and keep it with the project notes.

```
Fresh-eyes session 1
Date:
Who:  (new to the site, not on the project)
Device: (phone / tablet / desktop)

Task 1  malaria symptoms        result: pass / stuck        time:
Task 2  when to seek care       result: pass / stuck        time:
Task 3  respiratory diseases     result: pass / stuck        time:
Task 4  search for something missing  result: pass / stuck   time:
Task 5  add / edit / delete      result: pass / stuck        time:

What went wrong:
What was confusing:
What was missing:
What should change first:

Fresh-eyes session 2
Date:
Who:
Device:

(answers in the same form)

Changes made after this session:
```

## Note for later

When the backend arrives, this same script is run again against the real
data, as the plan asks in B7. The sample data will be replaced, so the
answers may change, but the questions stay the same.
