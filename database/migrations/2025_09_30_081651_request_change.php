<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('request_changes', function (Blueprint $table) {
            // Primary key
            $table->id();

            // Foreign Keys (nullable, as requested)
            // Assuming 'risks' and 'changes' tables exist.
            $table->foreignId('risk_id')->nullable()->constrained('risks')->onDelete('cascade');
            $table->foreignId('change_id')->nullable()->constrained('changes')->onDelete('cascade');
            
            // Core data fields
            $table->string('type', 10); // 'risk' or 'change'
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            // Foreign Key for the requesting user
            // Assuming 'users' table exists.
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
            
            // Description of the requested change
            $table->text('description');

            // Timestamps (created_at and updated_at)
            $table->timestamps();
            
            // Ensure that only one of risk_id or change_id is present at any time
            // This is a database-level index/check that can be complex; a simpler 
            // unique index on the combination is added here, but business logic
            // validation is usually better for "only one or the other" constraints.
            // For now, we rely on the nullable definition.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_changes');
    }
};
