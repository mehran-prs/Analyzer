<?php

return [
    'res_path' => '/var/sniffer/res',

    'days_limit'  => 30,

    /*--------------------------------------
        Non Numeric Fields in sniffed file.
    --------------------------------------*/
    'non_numeric' => ['name', 'ports', 'ips'],

    /*--------------------------------------
        Field that shoudl format .
    --------------------------------------*/
    'format_field'=>'len',
];