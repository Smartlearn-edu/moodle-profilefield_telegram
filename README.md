# Moodle Telegram Profile Field (`profilefield_telegram`)

Custom user profile field type for Moodle LMS providing an international phone number input with a searchable country code dropdown, Egypt default (+20), trunk zero stripping, and automatic E.164 normalization for Telegram bot messaging and verification.

## Features
- **Searchable Country Dropdown**: Live search by dial code (e.g. `20`, `966`) or country name in English and Arabic (`Egypt`, `مصر`).
- **Egypt Default**: Pre-selects Egypt (`🇪🇬 +20`) by default, with priority given to Arab League nations followed by all global countries.
- **E.164 Normalization**: Automatically strips local trunk zeros (`010...` -> `+2010...`) and converts Arabic-Indic digits (`٠-٩` to `0-9`).
- **Auto-Sync with Moodle Country**: Changing the profile's country dropdown automatically updates the phone country dial code.
- **Theme Independent**: Completely decoupled from themes, functioning natively on all Moodle forms (Signup, Edit Profile, Admin).

## Installation
Place this plugin into your Moodle installation at:
```
user/profile/field/telegram
```
Then log in as administrator and complete the database upgrade.

## License
GNU General Public License v3 or later.
