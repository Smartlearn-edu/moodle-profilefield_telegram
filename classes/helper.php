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

namespace profilefield_telegram;

defined('MOODLE_INTERNAL') || die();

/**
 * Helper utility for phone number formatting, country codes, and E.164 normalization.
 *
 * @package     profilefield_telegram
 * @copyright   2026 Mohammad Nabil <mohammad@smartlearn.education>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class helper {

    /**
     * Complete standard ISO-2 to dial code mapping.
     *
     * @var array<string, string>
     */
    protected static array $dialcodes = [
        'AF' => '93', 'AL' => '355', 'DZ' => '213', 'AS' => '1684', 'AD' => '376', 'AO' => '244',
        'AI' => '1264', 'AQ' => '672', 'AG' => '1268', 'AR' => '54', 'AM' => '374', 'AW' => '297',
        'AU' => '61', 'AT' => '43', 'AZ' => '994', 'BS' => '1242', 'BH' => '973', 'BD' => '880',
        'BB' => '1246', 'BY' => '375', 'BE' => '32', 'BZ' => '501', 'BJ' => '229', 'BM' => '1441',
        'BT' => '975', 'BO' => '591', 'BA' => '387', 'BW' => '267', 'BR' => '55', 'IO' => '246',
        'VG' => '1284', 'BN' => '673', 'BG' => '359', 'BF' => '226', 'BI' => '257', 'KH' => '855',
        'CM' => '237', 'CA' => '1', 'CV' => '238', 'KY' => '1345', 'CF' => '236', 'TD' => '235',
        'CL' => '56', 'CN' => '86', 'CX' => '61', 'CC' => '61', 'CO' => '57', 'KM' => '269',
        'CK' => '682', 'CR' => '506', 'HR' => '385', 'CU' => '53', 'CW' => '599', 'CY' => '357',
        'CZ' => '420', 'CD' => '243', 'DK' => '45', 'DJ' => '253', 'DM' => '1767', 'DO' => '1809',
        'EC' => '593', 'EG' => '20', 'SV' => '503', 'GQ' => '240', 'ER' => '291', 'EE' => '372',
        'SZ' => '268', 'ET' => '251', 'FK' => '500', 'FO' => '298', 'FJ' => '679', 'FI' => '358',
        'FR' => '33', 'GF' => '594', 'PF' => '689', 'GA' => '241', 'GM' => '220', 'GE' => '995',
        'DE' => '49', 'GH' => '233', 'GI' => '350', 'GR' => '30', 'GL' => '299', 'GD' => '1473',
        'GP' => '590', 'GU' => '1671', 'GT' => '502', 'GG' => '44', 'GN' => '224', 'GW' => '245',
        'GY' => '592', 'HT' => '509', 'HN' => '504', 'HK' => '852', 'HU' => '36', 'IS' => '354',
        'IN' => '91', 'ID' => '62', 'IR' => '98', 'IQ' => '964', 'IE' => '353', 'IM' => '44',
        'IL' => '972', 'IT' => '39', 'CI' => '225', 'JM' => '1876', 'JP' => '81', 'JE' => '44',
        'JO' => '962', 'KZ' => '7', 'KE' => '254', 'KI' => '686', 'XK' => '383', 'KW' => '965',
        'KG' => '996', 'LA' => '856', 'LV' => '371', 'LB' => '961', 'LS' => '266', 'LR' => '231',
        'LY' => '218', 'LI' => '423', 'LT' => '370', 'LU' => '352', 'MO' => '853', 'MG' => '261',
        'MW' => '265', 'MY' => '60', 'MV' => '960', 'ML' => '223', 'MT' => '356', 'MH' => '692',
        'MQ' => '596', 'MR' => '222', 'MU' => '230', 'YT' => '262', 'MX' => '52', 'FM' => '691',
        'MD' => '373', 'MC' => '377', 'MN' => '976', 'ME' => '382', 'MS' => '1664', 'MA' => '212',
        'MZ' => '258', 'MM' => '95', 'NA' => '264', 'NR' => '674', 'NP' => '977', 'NL' => '31',
        'NC' => '687', 'NZ' => '64', 'NI' => '505', 'NE' => '227', 'NG' => '234', 'NU' => '683',
        'NF' => '672', 'KP' => '850', 'MK' => '389', 'MP' => '1670', 'NO' => '47', 'OM' => '968',
        'PK' => '92', 'PW' => '680', 'PS' => '970', 'PA' => '507', 'PG' => '675', 'PY' => '595',
        'PE' => '51', 'PH' => '63', 'PL' => '48', 'PT' => '351', 'PR' => '1787', 'QA' => '974',
        'CG' => '242', 'RE' => '262', 'RO' => '40', 'RU' => '7', 'RW' => '250', 'BL' => '590',
        'SH' => '290', 'KN' => '1869', 'LC' => '1758', 'MF' => '590', 'PM' => '508', 'VC' => '1784',
        'WS' => '685', 'SM' => '378', 'ST' => '239', 'SA' => '966', 'SN' => '221', 'RS' => '381',
        'SC' => '248', 'SL' => '232', 'SG' => '65', 'SX' => '1721', 'SK' => '421', 'SI' => '386',
        'SB' => '677', 'SO' => '252', 'ZA' => '27', 'KR' => '82', 'SS' => '211', 'ES' => '34',
        'LK' => '94', 'SD' => '249', 'SR' => '597', 'SE' => '46', 'CH' => '41', 'SY' => '963',
        'TW' => '886', 'TJ' => '992', 'TZ' => '255', 'TH' => '66', 'TL' => '670', 'TG' => '228',
        'TK' => '690', 'TO' => '676', 'TT' => '1868', 'TN' => '216', 'TR' => '90', 'TM' => '993',
        'TC' => '1649', 'TV' => '688', 'UG' => '256', 'UA' => '380', 'AE' => '971', 'GB' => '44',
        'US' => '1', 'UY' => '598', 'UZ' => '998', 'VU' => '678', 'VA' => '379', 'VE' => '58',
        'VN' => '84', 'VI' => '1340', 'WF' => '681', 'YE' => '967', 'ZM' => '260', 'ZW' => '263'
    ];

    /**
     * Priority Arab League and top countries with Egypt first.
     *
     * @var array<string>
     */
    protected static array $priority = [
        'EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'SY',
        'LB', 'PS', 'YE', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO',
        'DJ', 'KM', 'US', 'GB', 'CA', 'TR', 'DE', 'FR', 'IN', 'PK',
        'MY', 'ID'
    ];

    /**
     * Get all dial codes.
     *
     * @return array<string, string>
     */
    public static function get_dial_codes(): array {
        return self::$dialcodes;
    }

    /**
     * Get priority country list.
     *
     * @return array<string>
     */
    public static function get_priority_countries(): array {
        return self::$priority;
    }

    /**
     * Generate Unicode regional indicator emoji flag for a 2-letter ISO code.
     *
     * @param string $iso
     * @return string
     */
    public static function get_flag_emoji(string $iso): string {
        $iso = strtoupper(trim($iso));
        if (strlen($iso) !== 2) {
            return '🌐';
        }
        $c1 = ord($iso[0]) - 65 + 0x1F1E6;
        $c2 = ord($iso[1]) - 65 + 0x1F1E6;
        return mb_chr($c1, 'UTF-8') . mb_chr($c2, 'UTF-8');
    }

    /**
     * Convert Eastern Arabic and Persian numerals to standard ASCII.
     *
     * @param string $str
     * @return string
     */
    public static function normalize_digits(string $str): string {
        $easternarabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        $persian       = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $ascii         = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        $str = str_replace($easternarabic, $ascii, $str);
        return str_replace($persian, $ascii, $str);
    }

    /**
     * Parse an existing phone string into structured data.
     *
     * @param string|null $phone
     * @param string $fallbackcountry
     * @return array{code: string, dial: string, number: string, e164: string}
     */
    public static function parse_phone(?string $phone, string $fallbackcountry = 'EG'): array {
        $fallbackcountry = strtoupper($fallbackcountry);
        if (!isset(self::$dialcodes[$fallbackcountry])) {
            $fallbackcountry = 'EG';
        }

        if (empty($phone)) {
            return [
                'code'   => $fallbackcountry,
                'dial'   => self::$dialcodes[$fallbackcountry],
                'number' => '',
                'e164'   => '',
            ];
        }

        $clean = preg_replace('/\D/', '', self::normalize_digits($phone));

        // Sort dial codes descending by length to match the most specific dial code first.
        $sorted = self::$dialcodes;
        uasort($sorted, fn($a, $b) => strlen($b) <=> strlen($a));

        foreach ($sorted as $iso => $dial) {
            if (str_starts_with($clean, $dial) && strlen($clean) > strlen($dial)) {
                $local = ltrim(substr($clean, strlen($dial)), '0');
                return [
                    'code'   => $iso,
                    'dial'   => $dial,
                    'number' => $local,
                    'e164'   => '+' . $dial . $local,
                ];
            }
        }

        // If no dial code match was found, treat as local number with fallback country.
        $local = ltrim($clean, '0');
        return [
            'code'   => $fallbackcountry,
            'dial'   => self::$dialcodes[$fallbackcountry],
            'number' => $local,
            'e164'   => '+' . self::$dialcodes[$fallbackcountry] . $local,
        ];
    }

    /**
     * Format into standard E.164 phone string.
     *
     * @param string $iso
     * @param string $localnumber
     * @return string
     */
    public static function format_e164(string $iso, string $localnumber): string {
        $iso = strtoupper(trim($iso));
        $dial = self::$dialcodes[$iso] ?? '20';
        $clean = preg_replace('/\D/', '', self::normalize_digits($localnumber));
        $clean = ltrim($clean, '0');

        if (empty($clean)) {
            return '';
        }

        return '+' . $dial . $clean;
    }
}
