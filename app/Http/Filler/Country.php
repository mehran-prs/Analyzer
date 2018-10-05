<?php
/**
 * Created by PhpStorm.
 * User: mehran
 * Date: 9/8/18
 * Time: 12:23 PM
 */

namespace App\Http\Filler;


class Country extends Filler
{
    /**
     * @var Port $portAnalyzer
     */
    protected $portAnalyzer;

    /**
     * @var IP $ipAnalyzer
     */
    protected $ipAnalyzer;

    /**
     * Country constructor.
     * @param array $nonNumeric
     */
    public function __construct(array $nonNumeric)
    {
        $this->nonNumeric=$nonNumeric;

        $this->portAnalyzer = new Port();

        $this->ipAnalyzer = new IP();
    }

    /**
     * @var array $tb analyzed data result.
     */
    protected $tb = [];

    /**
     * @param $ccode
     * @param $record
     * @return array
     */
    public function initRecord($record)
    {
        return [
            'name'  => $record['name'],
            'ips'   => [],
            'ports' => []
        ];
    }

    /**
     * Get sniffer result file content and add to result records.
     *
     * @param $data
     */
    public function processWholeData($data)
    {
        foreach ($data as $ccode => $values)
            $this->fill($ccode, $values);
    }

    /**
     * @param $ccode
     * @param $values
     * @return mixed
     */
    public function fill($ccode, $values)
    {
        if (!array_key_exists($ccode, $this->tb))
            $this->tb[$ccode] = $this->initRecord($values);

        $c = &$this->tb[$ccode];

        $this->rawFill($c, $values);

        // Fill port layer
        $this->portAnalyzer->fill($c['ports'], $values['ports']);
        // Fill ip layer
        $this->ipAnalyzer->processWholeData($c['ips'], $values['ips']);
    }

    public function getTb()
    {
        return $this->tb;
    }

    /**
     * @return array
     */
    public function getNonNumeric(): array
    {
        return $this->nonNumeric;
    }


}