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

/**
 * Telegram Profile Field AMD Module.
 *
 * Implements searchable country code selector (Egypt default), live filtering by
 * dial code or country name, Arabic numerals conversion, trunk zero stripping,
 * and E.164 normalization.
 *
 * @module     profilefield_telegram/form
 * @copyright  2026 Mohammad Nabil <mohammad@smartlearn.education>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['core/str'], function(Str) {
    'use strict';

    /**
     * Standard ISO-2 to dial code map.
     */
    var COUNTRY_DIAL_CODES = {
        AF: '93', AL: '355', DZ: '213', AS: '1684', AD: '376', AO: '244', AI: '1264', AQ: '672', AG: '1268', AR: '54',
        AM: '374', AW: '297', AU: '61', AT: '43', AZ: '994', BS: '1242', BH: '973', BD: '880', BB: '1246', BY: '375',
        BE: '32', BZ: '501', BJ: '229', BM: '1441', BT: '975', BO: '591', BA: '387', BW: '267', BR: '55', IO: '246',
        VG: '1284', BN: '673', BG: '359', BF: '226', BI: '257', KH: '855', CM: '237', CA: '1', CV: '238', KY: '1345',
        CF: '236', TD: '235', CL: '56', CN: '86', CX: '61', CC: '61', CO: '57', KM: '269', CK: '682', CR: '506',
        HR: '385', CU: '53', CW: '599', CY: '357', CZ: '420', CD: '243', DK: '45', DJ: '253', DM: '1767', DO: '1809',
        EC: '593', EG: '20', SV: '503', GQ: '240', ER: '291', EE: '372', SZ: '268', ET: '251', FK: '500', FO: '298',
        FJ: '679', FI: '358', FR: '33', GF: '594', PF: '689', GA: '241', GM: '220', GE: '995', DE: '49', GH: '233',
        GI: '350', GR: '30', GL: '299', GD: '1473', GP: '590', GU: '1671', GT: '502', GG: '44', GN: '224', GW: '245',
        GY: '592', HT: '509', HN: '504', HK: '852', HU: '36', IS: '354', IN: '91', ID: '62', IR: '98', IQ: '964',
        IE: '353', IM: '44', IL: '972', IT: '39', CI: '225', JM: '1876', JP: '81', JE: '44', JO: '962', KZ: '7',
        KE: '254', KI: '686', XK: '383', KW: '965', KG: '996', LA: '856', LV: '371', LB: '961', LS: '266', LR: '231',
        LY: '218', LI: '423', LT: '370', LU: '352', MO: '853', MG: '261', MW: '265', MY: '60', MV: '960', ML: '223',
        MT: '356', MH: '692', MQ: '596', MR: '222', MU: '230', YT: '262', MX: '52', FM: '691', MD: '373', MC: '377',
        MN: '976', ME: '382', MS: '1664', MA: '212', MZ: '258', MM: '95', NA: '264', NR: '674', NP: '977', NL: '31',
        NC: '687', NZ: '64', NI: '505', NE: '227', NG: '234', NU: '683', NF: '672', KP: '850', MK: '389', MP: '1670',
        NO: '47', OM: '968', PK: '92', PW: '680', PS: '970', PA: '507', PG: '675', PY: '595', PE: '51', PH: '63',
        PL: '48', PT: '351', PR: '1787', QA: '974', CG: '242', RE: '262', RO: '40', RU: '7', RW: '250', BL: '590',
        SH: '290', KN: '1869', LC: '1758', MF: '590', PM: '508', VC: '1784', WS: '685', SM: '378', ST: '239', SA: '966',
        SN: '221', RS: '381', SC: '248', SL: '232', SG: '65', SX: '1721', SK: '421', SI: '386', SB: '677', SO: '252',
        ZA: '27', KR: '82', SS: '211', ES: '34', LK: '94', SD: '249', SR: '597', SE: '46', CH: '41', SY: '963',
        TW: '886', TJ: '992', TZ: '255', TH: '66', TL: '670', TG: '228', TK: '690', TO: '676', TT: '1868', TN: '216',
        TR: '90', TM: '993', TC: '1649', TV: '688', UG: '256', UA: '380', AE: '971', GB: '44', US: '1', UY: '598',
        UZ: '998', VU: '678', VA: '379', VE: '58', VN: '84', VI: '1340', WF: '681', YE: '967', ZM: '260', ZW: '263'
    };

    /**
     * Priority countries (Egypt first, then Arab League and major partners).
     */
    var PRIORITY_COUNTRY_CODES = [
        'EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'SY',
        'LB', 'PS', 'YE', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO',
        'DJ', 'KM', 'US', 'GB', 'CA', 'TR', 'DE', 'FR', 'IN', 'PK',
        'MY', 'ID'
    ];

    /**
     * Fallback country names in English.
     */
    var FALLBACK_COUNTRY_NAMES = {
        EG: 'Egypt', SA: 'Saudi Arabia', AE: 'United Arab Emirates', KW: 'Kuwait',
        QA: 'Qatar', BH: 'Bahrain', OM: 'Oman', JO: 'Jordan', IQ: 'Iraq',
        SY: 'Syria', LB: 'Lebanon', PS: 'Palestine', YE: 'Yemen', SD: 'Sudan',
        LY: 'Libya', TN: 'Tunisia', DZ: 'Algeria', MA: 'Morocco', MR: 'Mauritania',
        SO: 'Somalia', DJ: 'Djibouti', KM: 'Comoros', US: 'United States',
        GB: 'United Kingdom', CA: 'Canada', TR: 'Turkey', DE: 'Germany',
        FR: 'France', IN: 'India', PK: 'Pakistan', MY: 'Malaysia', ID: 'Indonesia'
    };

    /**
     * Convert Eastern Arabic and Persian numerals to standard ASCII.
     *
     * @param {string} str
     * @returns {string}
     */
    function normalizeDigits(str) {
        if (!str) {
            return '';
        }
        var easternArabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        var persian       = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        var result = str.toString();
        for (var i = 0; i < 10; i++) {
            result = result.replace(new RegExp(easternArabic[i], 'g'), i.toString());
            result = result.replace(new RegExp(persian[i], 'g'), i.toString());
        }
        return result;
    }

    /**
     * Compute flag emoji from 2-letter ISO country code.
     *
     * @param {string} countryCode
     * @returns {string}
     */
    function getFlagEmoji(countryCode) {
        if (!countryCode || countryCode.length !== 2) {
            return '🌐';
        }
        try {
            var codePoints = countryCode.toUpperCase().split('').map(function(char) {
                return 127397 + char.charCodeAt(0);
            });
            return String.fromCodePoint.apply(null, codePoints);
        } catch (e) {
            return '🌐';
        }
    }

    return {
        /**
         * Initialize the Telegram phone input widget.
         *
         * @param {Object} config Configuration object with elementId and defaultCountry.
         */
        init: function(config) {
            config = config || {};
            var elementId = config.elementId;
            var defaultCountry = config.defaultCountry || 'EG';

            var phoneInput = document.getElementById(elementId) ||
                             document.querySelector('input[name="' + elementId + '"]');
            if (!phoneInput) {
                return;
            }

            if (phoneInput.getAttribute('data-telegram-phone-enhanced') === '1') {
                return;
            }
            phoneInput.setAttribute('data-telegram-phone-enhanced', '1');

            // Extract localized country names from Moodle's native #id_country if present.
            var moodleCountrySelect = document.getElementById('id_country') ||
                                      document.querySelector('select[name="country"]');
            var moodleCountryNames = {};
            if (moodleCountrySelect && moodleCountrySelect.options) {
                for (var m = 0; m < moodleCountrySelect.options.length; m++) {
                    var mOpt = moodleCountrySelect.options[m];
                    if (mOpt.value) {
                        moodleCountryNames[mOpt.value.toUpperCase()] = mOpt.text.trim();
                    }
                }
            }

            function getCountryName(iso) {
                return moodleCountryNames[iso] || FALLBACK_COUNTRY_NAMES[iso] || iso;
            }

            var currentSelectedIso = defaultCountry.toUpperCase();
            if (!COUNTRY_DIAL_CODES[currentSelectedIso]) {
                currentSelectedIso = 'EG';
            }

            // Create input-group container.
            var group = document.createElement('div');
            group.className = 'input-group flex-nowrap sl-telegram-phone-group mb-1';
            group.setAttribute('dir', 'ltr');
            group.style.width = '100%';
            group.style.maxWidth = '460px';
            group.style.position = 'relative';

            // 1. Dropdown Wrapper.
            var dropdownWrapper = document.createElement('div');
            dropdownWrapper.className = 'dropdown sl-country-dropdown flex-shrink-0';
            dropdownWrapper.style.position = 'relative';

            // Country Trigger Button.
            var countryBtn = document.createElement('button');
            countryBtn.type = 'button';
            countryBtn.id = 'sl-country-btn-' + elementId;
            countryBtn.className = 'btn btn-outline-secondary d-flex align-items-center justify-content-between px-2 sl-country-btn';
            countryBtn.style.width = '108px';
            countryBtn.style.maxWidth = '108px';
            countryBtn.style.minWidth = '98px';
            countryBtn.style.height = '100%';
            countryBtn.style.borderTopRightRadius = '0';
            countryBtn.style.borderBottomRightRadius = '0';
            countryBtn.style.fontSize = '0.92rem';
            countryBtn.style.fontWeight = '500';
            countryBtn.setAttribute('aria-expanded', 'false');

            var initialFlag = getFlagEmoji(currentSelectedIso);
            var initialDial = COUNTRY_DIAL_CODES[currentSelectedIso] || '20';

            countryBtn.innerHTML =
                '<span class="sl-btn-flag me-1">' + initialFlag + '</span>' +
                '<span class="sl-btn-dial me-1 font-monospace">+' + initialDial + '</span>' +
                '<i class="fa fa-chevron-down ms-auto text-muted" style="font-size: 0.68rem;"></i>';

            // Dropdown Menu Popover.
            var menu = document.createElement('div');
            menu.id = 'sl-country-menu-' + elementId;
            menu.className = 'sl-country-menu shadow-lg p-2 rounded-3';
            menu.style.display = 'none';
            menu.style.position = 'absolute';
            menu.style.top = 'calc(100% + 4px)';
            menu.style.left = '0';
            menu.style.zIndex = '1060';
            menu.style.width = '300px';
            menu.style.maxWidth = '90vw';
            menu.style.maxHeight = '320px';
            menu.style.overflow = 'hidden';

            // Search Box inside Dropdown Menu.
            var searchBoxWrapper = document.createElement('div');
            searchBoxWrapper.className = 'mb-2';
            searchBoxWrapper.innerHTML =
                '<div class="input-group input-group-sm">' +
                '  <span class="input-group-text bg-transparent border-end-0 text-muted"><i class="fa fa-search"></i></span>' +
                '  <input type="text" class="form-control form-control-sm border-start-0 sl-country-search" ' +
                '         placeholder="Search (e.g. 20, Egypt, مصر)..." autocomplete="off" style="font-size: 0.85rem;">' +
                '</div>';
            menu.appendChild(searchBoxWrapper);

            var searchInput = searchBoxWrapper.querySelector('.sl-country-search');

            // Scrollable list container.
            var listContainer = document.createElement('div');
            listContainer.className = 'sl-country-list custom-scrollbar';
            listContainer.style.maxHeight = '230px';
            listContainer.style.overflowY = 'auto';

            // Empty results message.
            var emptyMsg = document.createElement('div');
            emptyMsg.className = 'text-center py-3 text-muted small d-none';
            emptyMsg.innerHTML = '<i class="fa fa-globe mb-1 d-block opacity-50"></i>No country found';
            listContainer.appendChild(emptyMsg);

            // Build country item list.
            var allCountryItems = [];
            var addedCodes = {};

            function addCountryItem(code, isPriority) {
                if (addedCodes[code] || !COUNTRY_DIAL_CODES[code]) {
                    return;
                }
                addedCodes[code] = true;
                var dial = COUNTRY_DIAL_CODES[code];
                var flag = getFlagEmoji(code);
                var name = getCountryName(code);
                allCountryItems.push({
                    code: code,
                    dial: dial,
                    flag: flag,
                    name: name,
                    isPriority: !!isPriority,
                    searchText: (code + ' ' + dial + ' +' + dial + ' ' + name).toLowerCase()
                });
            }

            PRIORITY_COUNTRY_CODES.forEach(function(code) {
                addCountryItem(code, true);
            });

            var remainingCodes = Object.keys(COUNTRY_DIAL_CODES).filter(function(code) {
                return !addedCodes[code];
            }).sort(function(a, b) {
                return getCountryName(a).localeCompare(getCountryName(b));
            });

            remainingCodes.forEach(function(code) {
                addCountryItem(code, false);
            });

            // 2. Visible Local Phone Input.
            var localInput = document.createElement('input');
            localInput.type = 'tel';
            localInput.id = 'sl-telegram-phone-local-' + elementId;
            localInput.className = 'form-control';
            localInput.placeholder = (currentSelectedIso === 'EG') ? '10 1234 5678' : '50 123 4567';
            localInput.autocomplete = 'tel-national';
            localInput.style.direction = 'ltr';
            localInput.style.textAlign = 'left';
            localInput.style.fontSize = '1rem';
            localInput.style.borderTopLeftRadius = '0';
            localInput.style.borderBottomLeftRadius = '0';

            // Render country buttons in the list.
            var itemElements = [];
            allCountryItems.forEach(function(c) {
                var itemBtn = document.createElement('button');
                itemBtn.type = 'button';
                itemBtn.className = 'btn btn-sm d-flex align-items-center w-100 text-start px-2 py-1 mb-1 rounded-2 sl-country-item';
                itemBtn.setAttribute('data-code', c.code);
                itemBtn.setAttribute('data-dial', c.dial);
                itemBtn.style.color = 'inherit';
                itemBtn.style.fontSize = '0.86rem';
                itemBtn.style.border = 'none';
                itemBtn.style.background = (c.code === currentSelectedIso) ? 'rgba(59, 130, 246, 0.12)' : 'transparent';

                itemBtn.innerHTML =
                    '<span class="me-2 fs-6 flex-shrink-0">' + c.flag + '</span>' +
                    '<span class="fw-bold text-primary me-2 font-monospace flex-shrink-0" style="min-width: 44px; font-size: 0.85rem;">+' + c.dial + '</span>' +
                    '<span class="text-truncate flex-grow-1">' + c.name + '</span>' +
                    '<i class="fa fa-check text-success ms-1 sl-item-check ' + (c.code === currentSelectedIso ? '' : 'd-none') + '"></i>';

                itemBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectCountryByIso(c.code);
                    closeDropdown();
                    localInput.focus();
                });

                listContainer.appendChild(itemBtn);
                itemElements.push({
                    element: itemBtn,
                    data: c
                });
            });

            menu.appendChild(listContainer);
            dropdownWrapper.appendChild(countryBtn);
            dropdownWrapper.appendChild(menu);

            // Assemble and mount into DOM.
            group.appendChild(dropdownWrapper);
            group.appendChild(localInput);

            phoneInput.parentNode.insertBefore(group, phoneInput);
            phoneInput.style.display = 'none';

            // Functions for updating state.
            function updateValue() {
                var dial = COUNTRY_DIAL_CODES[currentSelectedIso] || '';
                var raw = normalizeDigits(localInput.value).trim();
                var clean = raw.replace(/\D/g, '');
                if (clean.startsWith('0')) {
                    clean = clean.replace(/^0+/, '');
                }

                if (clean.length > 0 && dial) {
                    phoneInput.value = '+' + dial + clean;
                } else {
                    phoneInput.value = '';
                }
            }

            function selectCountryByIso(iso) {
                if (!iso) {
                    return false;
                }
                iso = iso.toUpperCase();
                if (!COUNTRY_DIAL_CODES[iso]) {
                    return false;
                }
                currentSelectedIso = iso;
                var dial = COUNTRY_DIAL_CODES[iso];
                var flag = getFlagEmoji(iso);

                var flagEl = countryBtn.querySelector('.sl-btn-flag');
                var dialEl = countryBtn.querySelector('.sl-btn-dial');
                if (flagEl) {
                    flagEl.textContent = flag;
                }
                if (dialEl) {
                    dialEl.textContent = '+' + dial;
                }

                itemElements.forEach(function(item) {
                    var isSelected = (item.data.code === iso);
                    var check = item.element.querySelector('.sl-item-check');
                    if (check) {
                        check.classList.toggle('d-none', !isSelected);
                    }
                    item.element.style.background = isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent';
                });

                if (iso === 'EG') {
                    localInput.placeholder = '10 1234 5678';
                } else if (iso === 'SA' || iso === 'AE') {
                    localInput.placeholder = '50 123 4567';
                } else {
                    localInput.placeholder = '123456789';
                }

                updateValue();
                return true;
            }

            // Dropdown show/hide.
            function openDropdown() {
                menu.style.display = 'block';
                countryBtn.setAttribute('aria-expanded', 'true');
                searchInput.value = '';
                itemElements.forEach(function(item) {
                    item.element.classList.remove('d-none');
                });
                emptyMsg.classList.add('d-none');
                setTimeout(function() {
                    searchInput.focus();
                }, 50);
            }

            function closeDropdown() {
                menu.style.display = 'none';
                countryBtn.setAttribute('aria-expanded', 'false');
            }

            countryBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (menu.style.display === 'none' || !menu.style.display) {
                    openDropdown();
                } else {
                    closeDropdown();
                }
            });

            document.addEventListener('click', function(e) {
                if (!dropdownWrapper.contains(e.target)) {
                    closeDropdown();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && menu.style.display === 'block') {
                    closeDropdown();
                    countryBtn.focus();
                }
            });

            // Live search filter in menu.
            searchInput.addEventListener('input', function() {
                var query = normalizeDigits(searchInput.value).trim().toLowerCase();
                var matchesCount = 0;

                itemElements.forEach(function(item) {
                    var match = false;
                    if (!query) {
                        match = true;
                    } else {
                        var cleanQuery = query.replace('+', '');
                        if (item.data.dial.indexOf(cleanQuery) === 0 || item.data.dial === cleanQuery) {
                            match = true;
                        } else if (item.data.searchText.indexOf(query) !== -1) {
                            match = true;
                        }
                    }

                    if (match) {
                        item.element.classList.remove('d-none');
                        matchesCount++;
                    } else {
                        item.element.classList.add('d-none');
                    }
                });

                if (matchesCount === 0) {
                    emptyMsg.classList.remove('d-none');
                } else {
                    emptyMsg.classList.add('d-none');
                }
            });

            // Parse initial value from phoneInput if already filled.
            var initialRaw = normalizeDigits(phoneInput.value).trim();
            if (initialRaw) {
                var digitsOnly = initialRaw.replace(/\D/g, '');
                var sortedDialEntries = Object.keys(COUNTRY_DIAL_CODES).map(function(code) {
                    return { code: code, dial: COUNTRY_DIAL_CODES[code] };
                }).sort(function(a, b) {
                    return b.dial.length - a.dial.length;
                });

                var matched = false;
                for (var k = 0; k < sortedDialEntries.length; k++) {
                    var entry = sortedDialEntries[k];
                    if (digitsOnly.startsWith(entry.dial) && digitsOnly.length > entry.dial.length) {
                        selectCountryByIso(entry.code);
                        var remaining = digitsOnly.substring(entry.dial.length).replace(/^0+/, '');
                        localInput.value = remaining;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    localInput.value = digitsOnly.replace(/^0+/, '');
                }
                updateValue();
            } else {
                var fallbackIso = (moodleCountrySelect && moodleCountrySelect.value) ? moodleCountrySelect.value : defaultCountry;
                if (!selectCountryByIso(fallbackIso)) {
                    selectCountryByIso('EG');
                }
                updateValue();
            }

            // User input in phone number.
            localInput.addEventListener('input', function() {
                var raw = normalizeDigits(localInput.value);
                if (raw.startsWith('+') || raw.startsWith('00')) {
                    var noPlus = raw.replace(/^(\+|00)/, '').replace(/\D/g, '');
                    var sortedEntries = Object.keys(COUNTRY_DIAL_CODES).map(function(code) {
                        return { code: code, dial: COUNTRY_DIAL_CODES[code] };
                    }).sort(function(a, b) {
                        return b.dial.length - a.dial.length;
                    });
                    for (var s = 0; s < sortedEntries.length; s++) {
                        var it = sortedEntries[s];
                        if (noPlus.startsWith(it.dial) && noPlus.length > it.dial.length) {
                            selectCountryByIso(it.code);
                            localInput.value = noPlus.substring(it.dial.length).replace(/^0+/, '');
                            break;
                        }
                    }
                }
                updateValue();
            });

            // Auto-sync with Moodle #id_country if changed by user.
            if (moodleCountrySelect) {
                moodleCountrySelect.addEventListener('change', function() {
                    var chosenIso = moodleCountrySelect.value;
                    if (chosenIso && COUNTRY_DIAL_CODES[chosenIso.toUpperCase()]) {
                        selectCountryByIso(chosenIso);
                    }
                });
            }

            // Mirror validation invalid state.
            if (window.MutationObserver) {
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.attributeName === 'class') {
                            var isInvalid = phoneInput.classList.contains('is-invalid');
                            localInput.classList.toggle('is-invalid', isInvalid);
                            countryBtn.classList.toggle('is-invalid', isInvalid);
                        }
                    });
                });
                observer.observe(phoneInput, { attributes: true, attributeFilter: ['class'] });
            }

            // Form submit capture to ensure formatted E.164 is sent.
            var form = phoneInput.closest('form');
            if (form) {
                form.addEventListener('submit', function() {
                    updateValue();
                }, true);
            }
        }
    };
});
