Parsing definition file /home/getty/sunriser/share/config_def.json


Key | Type | Default | Description
--- | ---- |:-------:| -----------
factory | bool | 0 | Is factory file (contains all data)
factory_version | text |  | Factory version
save_version | text |  | Version used to save this config
model | text |  | Firmware made for this model (human)
model_id | text |  | Firmware made for this model (short)
pwm_count | integer |  | Amount of pwms
no_error_logging | bool | 0 | Deactivate error logging
info_logging | bool | 0 | Activate main logging
service_value | integer | 1000 | Service value used last time
created_by | text |  | Creator of this image
savecount | integer |  | Count of saves on custom file (autoset by system, always 0 on factory files)
updated | datetime |  | Timestamp of last update (autoset by system)
created | datetime |  | Timestamp of config generation (autoset by system)
password | text |  | Login password
usentp | bool | 1 | Use NTP server
ntpserver | text | pool.ntp.org | NTP server hostname
useip4 | bool | 0 | Used fixed IPv4 instead of DHCP
nohelp | bool | 0 | Don't show help
showexpert | bool | 0 | Show expert form fields
ignoreupgrade | bool | 0 | No upgrade banderole display
nofinder | bool | 0 | Deactivate SunRiser Finder
nomdns | bool | 0 | [LEGACY] Deactivate mdns
higherminimum | bool | 0 | Higher minimum lightning
oldfade | bool | 0 | Use first concept for fade
enforcenet | bool | 0 | Reboot till DHCP is not timing out
ip4 | ip4 |  | Set fixed IPv4
ip4_netmask | ip4 |  | IPv4 Netmask
ip4_gateway | ip4 |  | IPv4 Gateway
ip4_dns | ip4 |  | IPv4 DNS
ip4_filter | bool | 0 | Use IPv4 access whitelist
ip4_whitelist | array(ip4) |  | IPv4 access whitelist
direct_ip4 | ip4 | 192.168.0.2 | Direct link IPv4
direct_ip4_netmask | ip4 | 255.255.255.0 | Direct link IPv4 Netmask
direct_ip4_gw | ip4 | 192.168.0.1 | Direct link IPv4 Gateway
webport | integer | 80 | Webserver Port
indexfile | text | index.html | Root file of webserver
language | text | de | Interface language (ISO 639-1)
timezone | integer | 31 | Timezone ID
gmtoff | integer | 60 | Timezone UTC offset in minutes during standard time
nodst | bool | 0 | Ignore Daylight Saving Time (TODO)
summertime | bool | 0 | It is summertime, add an hour
name | text |  | Custom visual name of device
hostname | text | sunriser | Hostname for the device
upgraded0500 | bool | 0 | Upgrade to 0.500 done
**pwm # X** |  |  | **Main data of PWM X**
pwm # X # manager | integer | 0 | Assigned manager, 0 = unassigned, 1 = dayplanner, 2 = weekplanner, 3 = celestial
pwm # X # max | integer | 1000 | Custom maximum value
pwm # X # onoff | bool | 0 | PWM only on/off
pwm # X # name | text |  | Custom name for pwm
pwm # X # color | text |  | Color definition
pwm # X # weather | integer |  | Weather program assigned
**web # X** |  |  | **Web files storage for file X**
web # X # content | binary |  | Content of file
web # X # gzip | bool |  | File is gzipped
web # X # bytes | integer |  | Original filesize (only on gzipped)
web # X # type | text |  | (TODO) Content type (else defined by file extension)
web # X # parse | bool |  | (TODO) Data goes through replace engine (else only done on .html)
web # X # extra_headers | text |  | (TODO) Extra headers to add on send out (need to be full)
web # X # deleted | bool |  | (TODO) File is deleted
**programs** |  |  | **Programs configuration**
**programs # setup # X** |  |  | **Program X**
programs # setup # X # marker | array(time,percent) |  | Control markers (time and percent)
programs # setup # X # name | text |  | Name for program
programs # setup # X # deleted | bool | 0 | Deleted weather profile
programs # last_setup_id | integer | 0 | Holding the last id used for new setup
programs # web | json | [] | Web configuration for programs
**weekplanner** |  |  | **Week planner configuration**
weekplanner # programs # X | array(integer) |  | Programs of the week for PWM X (always 8, last = all day)
weekplanner # randomdeferralmax | integer | 0 | (TODO) Maximum random deferral (in minutes)
weekplanner # deferral | integer | 0 | (TODO) Fixed deferral (in minutes)
**dayplanner** |  |  | **Day planner configuration**
dayplanner # marker # X | array(time,percent) |  | Control markers for PWM X (time and percent)
dayplanner # randomdeferralmax | integer | 0 | (TODO) Maximum random deferral (in minutes)
dayplanner # deferral | integer | 0 | (TODO) Fixed deferral (in minutes)
**weather** |  |  | **Weather simulation configuration**
weather # last_setup_id | integer | 0 | Holding the last id used for new setup
weather # web | json |  | Web configuration for the weather profiles
**weather # setup # X** |  |  | **Weather simulation setup X**
weather # setup # X # name | text |  | Name of the weather profile
weather # setup # X # deleted | bool | 0 | Deleted weather profile
weather # setup # X # pwms | array(integer) |  | [LEGACY] Identification of pwms effected (Ignored)
**weather # setup # X # thunder** |  |  | **Thunderstorm setup**
weather # setup # X # thunder # activated | bool | 0 | Produce thunderstorms
weather # setup # X # thunder # daychance | integer | 35 | Percentage for a thunderstorm to happen (Tried per day in daymax amount)
weather # setup # X # thunder # daymax | integer | 3 | Maximum amount of thunderstorms per day
weather # setup # X # thunder # minstorm | integer | 30 | Minimum length of a storm in minutes
weather # setup # X # thunder # randstorm | integer | 120 | Maximum length added to a storm length in minutes
weather # setup # X # thunder # nightonly | bool |  | [LEGACY] Ignored
weather # setup # X # thunder # zeroonly | bool | 0 | Thunderstorm only if dayplanner sets pwm to 0
weather # setup # X # thunder # nozeroonly | bool | 0 | Thunderstorm only if dayplanner sets pwm to not 0
weather # setup # X # thunder # weekdays | array(weekday) |  | Apply thunderstorms to given weekdays (else always)
weather # setup # X # thunder # minrainextra | integer | 2 | Minimum rainfront length extra in minutes
weather # setup # X # thunder # randrainextra | integer | 10 | Maximum rainfront length extra added in minutes
weather # setup # X # thunder # preflashlength | integer | 150 | Length of preflash in milliseconds
weather # setup # X # thunder # pauselength | integer | 200 | Pause between preflash and main flash
weather # setup # X # thunder # fullflashlength | integer | 300 | Length of main flash in milliseconds
weather # setup # X # thunder # deloadflashlength | integer | 150 | Length of postflashs in milliseconds
weather # setup # X # thunder # deloadpauselength | integer | 200 | Pause between postflashs in milliseconds
weather # setup # X # thunder # minflashpause | integer | 30 | Minimum seconds between lightnings
weather # setup # X # thunder # randflashpause | integer | 120 | Maximum seconds added between lightnings
weather # setup # X # thunder # preflash | integer | 8 | Strength of the lightning preflash
weather # setup # X # thunder # flash | integer | 16 | Strength of the main lightning flash
weather # setup # X # thunder # mindeload | integer | 2 | Minimum amount of deloads
weather # setup # X # thunder # randdeload | integer | 2 | Maximum random amount of deloads added
weather # setup # X # thunder # fixdeload | integer | 0 | Same strength for all deload flashes if set higher than 0
weather # setup # X # thunder # permanent | bool | 0 | Permanent thunderstorms
**weather # setup # X # moon** |  |  | **Moon setup**
weather # setup # X # moon # activated | bool | 0 | Show moonphase based on reality
weather # setup # X # moon # maximum | integer | 100 | Maximum intensity of moonlight
weather # setup # X # moon # weekdays | array(weekday) |  | Apply moon to given weekdays (else every day)
**weather # setup # X # clouds** |  |  | **Clouds setup**
weather # setup # X # clouds # activated | bool | 0 | Show clouds
weather # setup # X # clouds # daychance | integer | 30 | Chance that it is a day with clouds
weather # setup # X # clouds # mincloudshare | integer | 10 | Minimum percentage share of cloud on a cloudy day
weather # setup # X # clouds # cloudshare | integer | 30 | Maximum percentage share of cloud on a cloudy day
weather # setup # X # clouds # clouddarkness | integer | 10 | Maximum darkness applied through cloud
weather # setup # X # clouds # mincloud | integer | 2 | Minimum length of cloud in seconds
weather # setup # X # clouds # randcloud | integer | 40 | Maximum length added to the cloud length in seconds
weather # setup # X # clouds # weekdays | array(weekday) |  | Weekdays who may have rain (else every day)
**weather # setup # X # rain** |  |  | **Rain setup**
weather # setup # X # rain # activated | bool | 0 | Make rainy days
weather # setup # X # rain # daychance | integer | 30 | Chance that the day is rainy (with clouds activated, also day with clouds automatically)
weather # setup # X # rain # minrainshare | integer | 10 | Minimum percentage share of rain on a rainy day
weather # setup # X # rain # rainshare | integer | 30 | Maximum percentage share of rain on a rainy day
weather # setup # X # rain # raincloudshare | integer | 80 | Maximum percentage share of cloud on a rainy day
weather # setup # X # rain # dropdarkness | integer | 10 | Maximum darkness applied through rain drop
weather # setup # X # rain # minrain | integer | 5 | Minimum length of rain in minutes
weather # setup # X # rain # randrain | integer | 60 | Maximum added length of rain in minutes
weather # setup # X # rain # weekdays | array(weekday) |  | Weekdays who may have rain (else every day)
weather # setup # X # rain # permanent | bool | 0 | Permanent rain


