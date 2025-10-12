<?php
use App\Models\Change;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ModelUpload;
use Illuminate\Support\Facades\Storage;
use App\Models\Risk;
use App\Models\requestChange;
use App\Http\Middleware\AdminMiddleware;

// ==================== Public Routes ====================
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// ==================== Admin Routes ====================
Route::middleware([AdminMiddleware::class, 'auth', 'verified'])->group(function(){

    // Change Request Management (ADMIN ONLY)
    Route::post('/requests/{id}/action', function (Request $request, $id) {
        $changeRequest = requestChange::findOrFail($id);
        $validated = $request->validate([
            'action' => 'required|string|in:accept,reject',
        ]);
        if ($changeRequest->status !== 'pending') {
            return redirect()->back()->withErrors(['status' => 'This request has already been processed.']);
        }
        $status = $validated['action'] === 'accept' ? 'approved' : 'rejected';
        $changeRequest->update(['status' => $status]);
        // TODO: Apply the change to the Risk or Change if needed
        return redirect()->back()->with('success', 'Change request ' . $status . '.');
    })->name('requests.action');

    Route::get('/requests/pending', function () {
        $changes = \App\Models\Change::all();
        $risks = Risk::all();
        $pendingRequests = requestChange::where('status', 'pending')
            ->with('risk', 'change', 'requester')
            ->get();
        return Inertia::render('admin/adminRequests', ['requests' => $pendingRequests, 'filter' => 'pending', 'changes'=>$changes, 'risks'=>$risks]);
    })->name('requests.pending.index');

    Route::get('/requests/processed', function () {
        $changes = \App\Models\Change::all();
        $risks = Risk::all();
        $processedRequests = requestChange::whereIn('status', ['approved', 'rejected'])
            ->with('risk', 'change', 'requester')
            ->orderBy('updated_at', 'desc')
            ->get();
        return Inertia::render('admin/adminRequests', ['requests' => $processedRequests, 'filter' => 'processed', 'changes'=>$changes, 'risks'=>$risks]);
    })->name('requests.processed.index');

    Route::delete('/requests/{id}', function ($id) {
        $changeRequest = requestChange::findOrFail($id);
        $changeRequest->delete();
        return redirect()->back()->with('success', 'Change request successfully deleted.');
    })->name('requests.destroy');

    Route::put('/requests/{id}', function (Request $request, $id) {
        $changeRequest = requestChange::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|string|in:approved,rejected',
        ]);
        if ($changeRequest->status !== 'pending') {
            return redirect()->back()->withErrors(['status' => 'This request has already been processed.']);
        }
        $changeRequest->update(['status' => $validated['status']]);
        // NOTE: Add logic here to apply changes to Risk/Change if status is 'approved'
        return redirect()->back()->with('success', 'Change request status updated to ' . $validated['status'] . '.');
    })->name('requests.update_status');
    
    // Change CRUD Routes (ADMIN ONLY)
    Route::get('/admin/changes',function(){
        $changes = \App\Models\Change::all();
        return Inertia::render('admin/viewChanges',['changes'=>$changes]);
    } );

Route::put('/changes/{id}', function (Request $request, $id) {
    $change = Change::findOrFail($id);

    $validated = $request->validate([
        'date' => 'nullable|date',
        'title' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'pelapor' => 'nullable|string|max:255',
        'status' => 'nullable|string|max:255',
        'object_id' => 'nullable|string|max:255',
        'urn' => 'nullable|string|max:255',
        'impact_analysis' => 'nullable|string',
        'mitigation_plan' => 'nullable|string',
        'approved_by' => 'nullable|string|max:255',
        'implemented_by' => 'nullable|string|max:255',
        'evaluation_notes' => 'nullable|string',
    ]);

    $change->update($validated);

    return redirect()->route('dashboard')->with('success', 'Change updated successfully!');
})->name('changes.update');



    Route::delete('/changes/{id}', function ($id) {
        $change = \App\Models\Change::findOrFail($id);
        $change->delete();
        return redirect()->back()->with('success', 'Change deleted successfully!');
    })->name('changes.destroy');

    // Risk CRUD Routes (ADMIN ONLY)
    Route::put('/risks/{id}', function (Request $request, $id) {
        $risk = Risk::findOrFail($id);
        $validated = $request->validate([
            'risk_code' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
            'tanggal_kejadian' => 'nullable|date',
            'deskripsi_risiko' => 'nullable|string',
            'penyebab' => 'nullable|string',
            'dampak' => 'nullable|string',
            'tindakan_mitigasi' => 'nullable|string',
            'status' => 'nullable|string|in:pending,aktif,selesai',
            'object_id' => 'nullable|string|max:255',
            'urn' => 'nullable|string|max:255',
        ]);
        $risk->update($validated);
        return redirect()->back()->with('success', 'Risk updated successfully!');
    })->name('risks.update');

    Route::delete('/risks/{id}', function ($id) {
        $risk = Risk::findOrFail($id);
        $risk->delete();
        return redirect()->back()->with('success', 'Risk deleted successfully!');
    })->name('risks.destroy');
});

// ==================== Protected Routes ====================
Route::middleware(['auth', 'verified'])->group(function () {

    // Change Request Submission (OPEN ACCESS)
    Route::get('/requests/self', function () {
        $pendingRequests = requestChange::where('requested_by', auth()->id())
            ->with('risk', 'change', 'requester')
            ->get();
        return Inertia::render('selfRequests', ['requests' => $pendingRequests]);
    });

    Route::post('/requests', function (Request $request) {
        $validated = $request->validate([
            'risk_id' => 'nullable|exists:risks,id',
            'change_id' => 'nullable|exists:changes,id',
            'type' => 'required|string|in:risk,change',
            'description' => 'required|string',
        ]);
        if (!($validated['risk_id'] xor $validated['change_id'])) {
            return redirect()->back()->withErrors(['ids' => 'Request must be linked to exactly one Risk or one Change item.']);
        }
        requestChange::create([
            'risk_id' => $validated['risk_id'],
            'change_id' => $validated['change_id'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'requested_by' => auth()->id(),
            'status' => 'pending',
        ]);
        return redirect()->back()->with('success', 'Change request submitted successfully and is pending admin review.');
    })->name('requests.store');

    // Change CRUD Routes (OPEN ACCESS)
    Route::get('/bim-view/changes/{urn}', function ($urn) {
        $changes = \App\Models\Change::where('urn', $urn)->get();
        return Inertia::render('changesView', ['urn' => $urn, 'changes' => $changes]);
    })->name('changes.index');

    Route::get('/changes/{id}', function ($id) {
        $change = \App\Models\Change::findOrFail($id);
        return Inertia::render('changeDetail', ['change' => $change]);
    })->name('changes.show');

    Route::post('/bim-view/changes/{urn}', function (Request $request, $urn) {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'pelapor' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
            'object_id' => 'nullable|integer',
            'impact_analysis' => 'nullable|string',
            'mitigation_plan' => 'nullable|string',
            'approved_by' => 'nullable|string|max:255',
            'implemented_by' => 'nullable|string|max:255',
            'evaluation_notes' => 'nullable|string',
        ]);

        $validated['urn'] = $urn;

        $change = \App\Models\Change::create($validated);

        return redirect()
            ->route('changes.show', $change->id)
            ->with('success', 'Change created successfully!');
    })->name('changes.store');


    // ModelUpload CRUD Routes
    Route::get('/models', function () {
        $uploads = ModelUpload::latest()->get();
        return Inertia::render('bimView', ['uploads' => $uploads]);
    })->name('models.index');

    Route::get('/models/{id}', function ($id) {
        $model = ModelUpload::findOrFail($id);
        return Inertia::render('modelDetail', ['model' => $model]);
    })->name('models.show');

    Route::post('/models', function (Request $request) {
        $model = ModelUpload::create([
            'urn' => $request->urn,
            'filename' => $request->filename,
        ]);
        return redirect()->route('models.show', $model->id)
            ->with('success', 'Model stored successfully!');
    })->name('models.store');

    Route::put('/models/{id}', function (Request $request, $id) {
        $model = ModelUpload::findOrFail($id);
        $model->update($request->only(['urn', 'filename']));
        return redirect()->route('models.show', $model->id)
            ->with('success', 'Model updated successfully!');
    })->name('models.update');

    Route::delete('/models/{id}', function ($id) {
        $model = ModelUpload::findOrFail($id);
        $model->delete();
        return redirect()->route('models.index')
            ->with('success', 'Model deleted successfully!');
    })->name('models.destroy');

    Route::post('/models/xls/{id}', function (Request $request, $id) {
        $request->validate([
            'excel_file' => 'nullable|file|mimes:xlsx,xls,csv|max:2048',
        ]);
        $model = ModelUpload::findOrFail($id);
        if ($request->hasFile('excel_file')) {
            $path = $request->file('excel_file')->store('excels', 'public');
            $model->excel_url = Storage::url($path);
        } else {
            $model->excel_url = null;
        }
        $model->save();
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Excel/CSV file uploaded successfully!',
                'excel_url' => $model->excel_url,
            ]);
        }
        return redirect()->back()->with('success', 'Excel/CSV file link updated successfully!');
    })->name('models.upload_xls');

    // List all risks for a given URN
    Route::get('/bim-view/risks/{urn}', function ($urn) {
        $risks = Risk::where('urn', $urn)->get();
        $changes = \App\Models\Change::where('urn', $urn)->get();
        return Inertia::render('risksView', [
            'urn' => $urn,
            'risks' => $risks,
            'changes' => $changes,
            'role' => auth()->user(),
        ]);
    })->name('risks.index');

    Route::get('/risks/{id}', function ($id) {
        $risk = Risk::findOrFail($id);
        $urn = $risk->urn;
        $risks = Risk::where('urn', $urn)->get();
        $changes = \App\Models\Change::where('urn', $urn)->get();
        return Inertia::render('risksView', [
            'urn' => $urn,
            'risks' => $risks,
            'changes' => $changes,
            'selectedRisk' => $risk,
        ]);
    })->name('risks.show');


    Route::post('/bim-view/risks/{urn}', function (Request $request, $urn) {
        $validated = $request->validate([
            'risk_code' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
            'tanggal_kejadian' => 'nullable|date',
            'deskripsi_risiko' => 'nullable|string',
            'penyebab' => 'nullable|string',
            'dampak' => 'nullable|string',
            'tindakan_mitigasi' => 'nullable|string',
            'status' => 'nullable|string|max:100',
            'object_id' => 'nullable|string|max:255',
        ]);
        $validated['status'] = 'pending';
        $validated['urn'] = $urn;
        $risk = Risk::create($validated);
        return redirect()->route('risks.show', $risk->id)
            ->with('success', 'Risk created successfully!');
    })->name('risks.store');

    // Other Views
    Route::get('/bim-view/{urn}', function ($urn) {
        return Inertia::render('modelViewer', ['urn' => $urn]);
    })->name('bim.model.view');

    Route::get('dashboard', function () {
        return Inertia::render('dashboard', ['user'=>auth()->user()]);
    })->name('dashboard');

    Route::get('bimUpload', function () {
        return Inertia::render('bimUpload');
    })->name('bimUpload');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
