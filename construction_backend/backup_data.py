import os
import shutil
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_backup():
    """
    Creates a zip archive containing the SQLite database and the media directory.
    Stores the backup in a 'backups' folder.
    """
    # Define paths based on the current directory (assuming script is in construction_backend)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'db.sqlite3')
    media_dir = os.path.join(base_dir, 'media')
    backup_dir = os.path.join(base_dir, 'backups')
    
    # Ensure the backups directory exists
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        logging.info(f"Created backup directory at {backup_dir}")

    # Generate a timestamp for the backup filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"construction_backup_{timestamp}"
    backup_zip_path = os.path.join(backup_dir, backup_name) # shutil.make_archive adds the .zip extension
    
    # Create a temporary staging directory to bundle files before zipping
    staging_dir = os.path.join(backup_dir, f"staging_{timestamp}")
    os.makedirs(staging_dir)
    
    try:
        # 1. Backup the database
        if os.path.exists(db_path):
            shutil.copy2(db_path, os.path.join(staging_dir, 'db.sqlite3'))
            logging.info(f"Copied database to staging area.")
        else:
            logging.warning(f"Database not found at {db_path}. Proceeding without it.")

        # 2. Backup the media folder
        if os.path.exists(media_dir):
            staging_media_dir = os.path.join(staging_dir, 'media')
            shutil.copytree(media_dir, staging_media_dir)
            logging.info(f"Copied media folder to staging area.")
        else:
            logging.warning(f"Media folder not found at {media_dir}. Proceeding without it.")

        # 3. Create the Zip Archive
        logging.info(f"Creating zip archive: {backup_zip_path}.zip...")
        shutil.make_archive(backup_zip_path, 'zip', staging_dir)
        
        logging.info(f"✅ Backup successful! Created {backup_zip_path}.zip")
        
        # Optional: Print file size
        mb_size = os.path.getsize(f"{backup_zip_path}.zip") / (1024 * 1024)
        logging.info(f"Backup Size: {mb_size:.2f} MB")

    except Exception as e:
        logging.error(f"❌ Backup failed: {str(e)}")
        
    finally:
        # 4. Clean up the staging directory
        if os.path.exists(staging_dir):
            shutil.rmtree(staging_dir)
            logging.info("Cleaned up staging area.")

if __name__ == "__main__":
    logging.info("Starting backup process...")
    create_backup()
    logging.info("Backup process finished.")
