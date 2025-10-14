<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Change;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Display a listing of the resource (Index).
     */
    public function index()
    {
        // FIX: Use Evaluation::latest()->paginate(10) without 'course' relation
        $evaluations = Evaluation::latest()->paginate(10);

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
        ]);
    }

    /**
     * Show the form for creating a new resource (Create).
     */
    public function create()
    {
        // FIX: Use Change model for dropdown
        $changes = Change::all(['id', 'title']);

        return Inertia::render('Evaluations/Create', [
            'changes' => $changes,
        ]);
    }

    /**
     * Store a newly created resource in storage (Store).
     * This method uses redirect()->back().
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'change_id' => 'required|exists:changes,id',
            'ratings' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string',
            'evaluated_by' => 'required|string|max:255',
            'evaluation_date' => 'required|date',
            'variansi_rencana' => 'required|string',
        ]);

        Evaluation::create($validated);

        return redirect()->back()
            ->with('success', 'Evaluation successfully created!');
    }

    /**
     * Display the specified resource (Show).
     */
    public function show(Evaluation $evaluation)
    {
        // FIX: Load 'change' relation if needed
        $evaluation->load('change');

        return Inertia::render('Evaluations/Show', [
            'evaluation' => $evaluation,
        ]);
    }

    /**
     * Show the form for editing the specified resource (Edit).
     */
    public function edit(Evaluation $evaluation)
    {
        $changes = Change::all(['id', 'title']);

        return Inertia::render('Evaluations/Edit', [
            'evaluation' => $evaluation,
            'changes' => $changes,
        ]);
    }

    /**
     * Update the specified resource in storage (Update).
     * This method uses redirect()->back().
     */
    public function update(Request $request, Evaluation $evaluation)
    {
        $validated = $request->validate([
            'change_id' => 'required|exists:changes,id',
            'ratings' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string',
            'evaluated_by' => 'required|string|max:255',
            'evaluation_date' => 'required|date',
            'variansi_rencana' => 'required|string',
        ]);

        $evaluation->update($validated);

        return redirect()->back()
            ->with('success', 'Evaluation successfully updated!');
    }

    /**
     * Remove the specified resource from storage (Destroy).
     * This method uses redirect()->back().
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();

        return redirect()->back()
            ->with('success', 'Evaluation successfully deleted!');
    }
}
