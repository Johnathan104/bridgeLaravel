
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RevitController;
use App\Http\Controllers\ChangeController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/models/{urn}', [RevitController::class, 'getModelByUrn']);

Route::get('/revit/token', [RevitController::class, 'getToken']);

// Get all changes
Route::get('/changes', [ChangeController::class, 'index']);
// Get change by ID
Route::get('/changes/{id}', [ChangeController::class, 'show']);