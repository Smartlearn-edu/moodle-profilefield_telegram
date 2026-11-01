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
 * Definition class for Telegram profile field settings in Site Administration.
 *
 * @package     profilefield_telegram
 * @copyright   2026 Mohammad Nabil <mohammad@smartlearn.education>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class profile_define_telegram extends profile_define_base {

    /**
     * Define field-specific configuration options in Site Administration.
     *
     * @param MoodleQuickForm $mform
     */
    public function define_form_specific($mform) {
        $countries = get_string_manager()->get_list_of_countries();
        $dialcodes = helper::get_dial_codes();

        $options = [];
        // Add priority countries first.
        foreach (helper::get_priority_countries() as $iso) {
            if (isset($countries[$iso], $dialcodes[$iso])) {
                $flag = helper::get_flag_emoji($iso);
                $options[$iso] = $flag . ' ' . $countries[$iso] . ' (+' . $dialcodes[$iso] . ')';
            }
        }

        // Add remaining countries.
        foreach ($countries as $iso => $name) {
            if (!isset($options[$iso]) && isset($dialcodes[$iso])) {
                $flag = helper::get_flag_emoji($iso);
                $options[$iso] = $flag . ' ' . $name . ' (+' . $dialcodes[$iso] . ')';
            }
        }

        $mform->addElement('select', 'defaultdata', get_string('defaultcountry', 'profilefield_telegram'), $options);
        $mform->setDefault('defaultdata', 'EG');
        $mform->addHelpButton('defaultdata', 'defaultcountry', 'profilefield_telegram');
    }

    /**
     * Preprocess the data before saving definition.
     *
     * @param stdClass|array $data
     * @return stdClass
     */
    public function define_save_preprocess($data) {
        $data = (object)$data;
        if (empty($data->defaultdata)) {
            $data->defaultdata = 'EG';
        }
        return $data;
    }
}
