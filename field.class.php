<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

use profilefield_telegram\helper;

defined('MOODLE_INTERNAL') || die();

/**
 * Custom profile field type for Telegram phone numbers.
 *
 * @package     profilefield_telegram
 * @copyright   2026 Mohammad Nabil <mohammad@smartlearn.education>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class profile_field_telegram extends profile_field_base {

    /**
     * Add the Telegram phone form field to the moodleform instance.
     *
     * @param MoodleQuickForm $mform
     */
    public function edit_field_add($mform) {
        global $PAGE, $USER;

        $inputattributes = [
            'maxlength' => 50,
            'size'      => 30,
            'class'     => 'profilefield_telegram_input',
            'dir'       => 'ltr',
            'placeholder' => '10 1234 5678',
        ];

        $mform->addElement('text', $this->inputname, format_string($this->field->name), $inputattributes);
        $mform->setType($this->inputname, PARAM_TEXT);

        $required = !$this->is_locked() && $this->is_required() && ($this->userid == $USER->id || isguestuser());
        if ($required) {
            $mform->addRule($this->inputname, get_string('required'), 'required', null, 'client');
        }

        $defaultcountry = !empty($this->field->defaultdata) ? $this->field->defaultdata : 'EG';

        $PAGE->requires->js_call_amd('profilefield_telegram/form', 'init', [
            'elementId'      => 'id_' . $this->inputname,
            'defaultCountry' => $defaultcountry,
        ]);
    }

    /**
     * Validate the data from the form.
     *
     * @param stdClass $usernew
     * @return array
     */
    public function edit_validate_field($usernew) {
        $errors = [];
        $fieldname = $this->inputname;

        if (empty($usernew->$fieldname)) {
            if ($this->is_required()) {
                $errors[$fieldname] = get_string('required');
            }
            return $errors;
        }

        $value = (string)$usernew->$fieldname;
        $clean = preg_replace('/\D/', '', helper::normalize_digits($value));

        if (strlen($clean) < 7 || strlen($clean) > 16) {
            $errors[$fieldname] = get_string('invalidphone', 'profilefield_telegram');
        }

        return $errors;
    }

    /**
     * Preprocess data before saving to {user_info_data}.
     *
     * Normalizes the phone into standard E.164 format.
     *
     * @param mixed $data
     * @param stdClass $datarecord
     * @return string
     */
    public function edit_save_data_preprocess($data, $datarecord) {
        if (empty($data)) {
            return '';
        }

        $data = helper::normalize_digits((string)$data);
        $defaultcountry = !empty($this->field->defaultdata) ? $this->field->defaultdata : 'EG';
        $parsed = helper::parse_phone($data, $defaultcountry);

        return !empty($parsed['number']) ? $parsed['e164'] : '';
    }

    /**
     * Display the data for this field.
     *
     * @return string
     */
    public function display_data() {
        if (empty($this->data)) {
            return '';
        }

        $parsed = helper::parse_phone((string)$this->data);
        $flag = helper::get_flag_emoji($parsed['code']);

        return s($flag . ' ' . $parsed['e164']);
    }
}
