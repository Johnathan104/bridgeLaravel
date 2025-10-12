<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ModelUpload;
class RevitController extends Controller
{
    public function getToken(){
        $tokenResponse = Http::asForm()
        ->post('https://developer.api.autodesk.com/authentication/v2/token', [
        'client_id' => env('APS_CLIENT_ID'),
        'client_secret' => env('APS_FORGE_CLIENT_SECRET'),
        'grant_type' => 'client_credentials',
        'scope' =>  'data:read data:write bucket:create',
        ]);
       $token = trim($tokenResponse->json('access_token'));
        return $token;
    }
    public function getModelByUrn($urn){
        $modl = ModelUpload::where('urn', $urn)->first();
        return $modl;
    }
    //
}
